/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   game.class.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/13 03:00:00 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/15 12:53:08 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import Lobby from './lobby.class';
import { BroadcastOperator, Server } from 'socket.io';
import Store from 'redis-json';
import { Bot } from '.';
import { pointOnLine, Line, angleToDegrees } from 'geometric';
import { Collider2d, Vector } from 'collider2d';
import PolygonMap from './polygon.class';
import { Power, PowerList } from './power.class';
import { Ball, Wall, Paddle } from '.';
import { shuffle } from 'lodash';
import GameTools from './gametools.class';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { SocketData } from 'src/socket';
import Player from './player.class';
import { Exclude, Expose } from 'class-transformer';

const FRAME_RATE = 30;
const TEST_MODE = false;

export enum MODE {
  Coalition = 'coalition',
  Battleground = 'battleground',
}

export default class Game {
  lobby: Lobby;
  balls: Ball[] = [];
  nBall = 1;
  players: Map<number, Player> = new Map();
  bots: Bot[];
  paddles: Paddle[] = [];
  walls: Wall[] = [];
  powers: Power[] = [];
  map: PolygonMap;
  mode: MODE = MODE.Battleground;
  timeElapsed = 0;
  paused = false;

  @Exclude()
  interval: NodeJS.Timer;
  @Exclude()
  intervalPowers: NodeJS.Timer;
  @Exclude()
  waitTimeout: NodeJS.Timeout;
  @Exclude()
  sayInterval: NodeJS.Timeout;

  constructor(lobby: Lobby) {
    this.lobby = lobby;
    this.bots = lobby.bots.map((v) => new Bot(v));
    this.players = new Map(this.lobby.players);
    this.newRound(7);
  }

  addBall() {
    const ball = new Ball(new Vector(this.map.center.x, this.map.center.y));
    // ball.setAngle(angleToRadians(this.map.angles[1]));
    ball.setAngle(GameTools.getRandomFloatArbitrary(0, Math.PI * 2));
    ball.findTarget(this.walls);
    this.balls.push(ball);
  }

  generateMap(n = 0) {
    this.balls = [];
    this.powers = [];
    this.timeElapsed = 0;

    this.map = new PolygonMap((this.nPlayers === 2 && 4) || this.nPlayers);
    this.paddles = [];
    const playersAndBotsToAssign = [...this.players.values(), ...this.bots];
    const randomPlayers: (Bot | Player)[] = shuffle(playersAndBotsToAssign);

    this.walls = this.map.edges.map((line: Line, index) => {
      let paddle = null;
      if (this.nPlayers > 2 || !(index % 2)) {
        const player = randomPlayers.pop();
        paddle = new Paddle(line, player.color);
        this.paddles.push(paddle);
        const wall = new Wall(line, paddle, player);
        player.attachWall(wall);
        return wall;
      }
      return new Wall(line, paddle);
    });
    for (let i = 0; i < this.nBall; i++) this.addBall();
    this.socket.emit('mapChange', this.mapNetScheme);
    this.socket.emit('gameUpdate', this.networkState);
  }

  run() {
    // this.generateMap(this.nPlayers);
    this.interval = setInterval(() => this.tick(), 1000 / FRAME_RATE);
    this.intervalPowers = setInterval(() => this.addRandomPower(), 5000);
  }
  stop() {
    clearInterval(this.interval);
    clearInterval(this.intervalPowers);
    clearInterval(this.sayInterval);
    this.interval = null;
    this.intervalPowers = null;
    this.sayInterval = null;
  }

  newRound(timer = 5) {
    this.generateMap();
    this.socket.emit('mapChange', this.mapNetScheme);
    this.resume(timer);
  }

  resume(timer = 5) {
    console.log('New round', this.players.size, this.bots.length);
    this.paused = true;
    if (this.isStopped) this.run();
    clearInterval(this.sayInterval);
    this.sayInterval = setInterval(() => {
      timer -= 1;
      if (timer === 0) {
        this.socket.emit('message', 'Goooo ooo ooo o o o o o o');
        // this.run();
        this.paused = false;
        clearInterval(this.sayInterval);
        this.sayInterval = null;
      } else {
        this.socket.emit('message', `Game resume in ${timer}s`);
      }
    }, 1000);
  }

  updatePaddlePercent(userId, percent: number) {
    const player = this.players.get(userId);
    if (player) player.wall.paddle.updatePercentOnAxis(percent);
  }

  runPhysics() {
    this.balls.forEach((ball, index) => {
      if (ball.targetDistance <= ball.targetInfo.limit) {
        const paddle: Paddle = ball.target.wall.paddle;
        if (paddle) {
          const paddleTouchTheBall = (pointOnLine as any)(
            ball.targetInfo.actualhit,
            paddle.line,
            1,
          );

          if (paddleTouchTheBall) {
            ball.bouncePaddle(paddle, this.walls);
            this.socket.emit('object', index, 'ball', ball.netScheme);
          } else {
            // En mode coalition, si le joueur qui envoie la balle est de la meme equipe de celui qui se prend le goal, alors ca rebondit
            if (
              TEST_MODE ||
              (this.mode === MODE.Coalition &&
                paddle.color === ball.lastHitten.color)
            ) {
              ball.bounceTargetWall(this.walls);
              this.socket.emit('object', index, 'ball', ball.netScheme);
            } else {
              this.reduce(ball.target.wall);
            }
          }
        } else {
          ball.bounceTargetWall(this.walls);
          this.socket.emit('object', index, 'ball', ball.netScheme);
        }
        ball.increaseSpeed();
      }
      ball.move();
    });
  }

  runBots() {
    this.bots.forEach((e) => {
      e.think();
    });
  }

  public reduce(wall: Wall) {
    if (wall.bot) {
      this.bots = this.bots.filter((b) => b !== wall.bot);
    } else if (wall.player) {
      // this.lobby.service.rankUser(this.lobby, wall.player.id);
      this.players.delete(wall.player.user.id);
    }
    // this.stop();
    if (this.nPlayers === 1 || this.players.size === 0) {
      this.stop();
      let winner: Player | Bot | null = null;
      if (this.bots.length) winner = this.bots.pop();
      else winner = [...this.players.values()].pop();
      console.log('THERE IS A WINNER', winner, this.bots, this.players);
      // this.lobby.service.closeLobby(this.lobby, winner);
      return;
    }
    // const timer = 1000;
    // this.socket.emit('timer', { timer });
    this.newRound();
  }

  @Expose()
  public get isStopped() {
    return !this.interval;
  }

  public get ballsNetScheme() {
    return this.balls.map((b) => b.netScheme);
  }

  public get paddlesNetScheme() {
    return this.paddles.map((b) => b.netScheme);
  }

  public get powersNetScheme() {
    return this.powers.map((p) => p.netScheme);
  }

  public get nPlayers() {
    return this.players.size + this.bots.length;
  }

  public get networkState() {
    return {
      balls: this.ballsNetScheme,
      paddles: this.paddlesNetScheme,
    };
  }
  public get mapNetScheme() {
    return {
      walls: this.walls.map((w) => w.netScheme),
      wallWidth: this.walls[0].width,
      angles: this.map.angles,
      verticles: this.map.verticles,
      inradius: this.map.inradius,
    };
  }

  public get netScheme() {
    return {
      map: this.mapNetScheme,
      balls: this.ballsNetScheme,
      paddles: this.paddlesNetScheme,
      powers: this.powersNetScheme,
    };
  }

  public get devTick() {
    return {
      ...this.map,
      paddles: [...this.paddles],
      balls: [...this.balls],
    };
  }

  public get id() {
    return `${this.lobby.id}`;
  }

  public ballsCollides() {
    for (let bIdx = 0; bIdx < this.balls.length; bIdx++) {
      const currBall = this.balls[bIdx];
      // Ball Collide with other balls
      for (let cIdx = bIdx + 1; cIdx < this.balls.length; cIdx++) {
        const compared: Ball = this.balls[cIdx];
        if (currBall.collideWithBall(compared)) {
          currBall.swapAngles(compared);
          currBall.findTarget(this.walls);
          compared.findTarget(this.walls);
          this.socket.emit('object', bIdx, 'ball', currBall.netScheme);
          this.socket.emit('object', cIdx, 'ball', compared.netScheme);
          break;
        }
      }

      // Ball Collide with powers
      for (let pIdx = 0; pIdx < this.powers.length; pIdx++) {
        const power: Power = this.powers[pIdx];
        if (power.collideWithBall(currBall)) {
          power.effect(currBall);
          this.powers.splice(pIdx, 1);
          this.socket.emit('powers', this.powersNetScheme);
        }
      }
    }
  }

  public addRandomPower() {
    const powerClass =
      PowerList[GameTools.getRandomArbitrary(0, PowerList.length)];
    const powerObj: Power = new powerClass(this, this.map.randomPosition());
    this.powers.push(powerObj);
    console.log(
      'Adding new power',
      powerObj.name,
      Object.keys(powerObj),
      typeof powerObj,
    );
    this.socket.emit(
      'powers',
      this.powers.map((p) => p.netScheme),
    );
  }

  public tick() {
    if (!this.paused) {
      this.timeElapsed += 1 / FRAME_RATE;
      this.ballsCollides();
      this.runPhysics();
      this.runBots();
    }
    this.socket.emit(
      'p',
      this.paddles.map((p) => [
        [p.line[0][0].toFixed(2), p.line[0][1].toFixed(2)],
        [p.line[1][0].toFixed(2), p.line[1][1].toFixed(2)],
      ]),
      this.balls.map(({ position: { x, y } }) => ({
        x: x.toFixed(2),
        y: y.toFixed(2),
      })),
    );
  }

  public get socket() {
    return this.lobby.sock;
  }
}
