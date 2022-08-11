/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   game.class.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/13 03:00:00 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/11 02:37:39 by adda-sil         ###   ########.fr       */
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
const TEST_MODE = true;

export enum MODE {
  Coalition = 'coalition',
  Battleground = 'battleground',
}

export default class Game {
  lobby: Lobby;
  balls: Ball[] = [];
  nBall = 1;
  nPlayers: number;
  players: Map<number, Player> = new Map();
  bots: Bot[];
  paddles: Paddle[] = [];
  walls: Wall[] = [];
  powers: Power[] = [];
  map: PolygonMap;
  mode: MODE = MODE.Battleground;
  timeElapsed = 0;

  @Exclude()
  interval: NodeJS.Timer;
  @Exclude()
  intervalPowers: NodeJS.Timer;

  constructor(lobby: Lobby) {
    this.lobby = lobby;
    this.nPlayers = lobby.playersMax;
    this.players = Object.assign(new Map<string, Player>(), lobby.players);
    this.bots = [];
    this.generateMap();
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

    // const arrayIndex = Array.from(Array(this.map.edges.length).keys());
    // const randomIndex: Array<number> = shuffle(arrayIndex);
    const playersAndBotsToAssign = [...this.players.values(), ...this.bots];
    const randomPlayers = shuffle(playersAndBotsToAssign);
    this.walls = this.map.edges.map((line: Line, index) => {
      let paddle = null;
      if (this.nPlayers > 2 || !(index % 2)) {
        paddle = new Paddle(line, index);
        this.paddles.push(paddle);
      }
      return new Wall(line, paddle);
    });
    for (let i = 0; i < this.nBall; i++) this.addBall();
    this.socket.emit('mapChange', this.mapNetScheme);
    this.socket.emit('gameUpdate', this.networkState);
  }

  run() {
    // this.generateMap(this.nPlayers);
    // this.socket.emit('mapChange', this.mapNetScheme);
    this.interval = setInterval(() => this.tick(), 1000 / FRAME_RATE);
    // this.intervalPowers = setInterval(() => this.addRandomPower(), 5000);
  }
  stop() {
    clearInterval(this.interval);
    // clearInterval(this.intervalPowers);
    this.interval = null;
    this.intervalPowers = null;
  }

  newRound() {
    let timer = 5;
    const intervalId = setInterval(() => {
      this.socket.emit('timer', timer);
      timer -= 1;
      if (timer === 0) {
        this.run();
        clearInterval(intervalId);
      }
    }, 1000);
  }

  updatePaddlePercent(percent: number) {
    // console.log("here is percent", percent);
    // this.paddles.forEach((paddle) => {
    this.paddles[this.paddles.length - 1].updatePercentOnAxis(percent);
    // paddle.updatePercentOnAxis(percent);
    // });
    // if (this.isPaused) debounce(
    //   this.socket.emit('gameUpdate', this.networkState),
    //   500
    // );
  }

  runPhysics() {
    this.balls.forEach((ball) => {
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
          } else {
            // En mode coalition, si le joueur qui envoie la balle est de la meme equipe de celui qui se prend le goal, alors ca rebondit
            if (
              TEST_MODE ||
              (this.mode === MODE.Coalition &&
                paddle.color === ball.lastHitten.color)
            ) {
              ball.bounceTargetWall(this.walls);
            } else {
              this.reduce();
            }
          }
        } else {
          ball.bounceTargetWall(this.walls);
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

  public reduce() {
    this.stop();
    // if (this.nPlayers > 4)
    if (this.nPlayers > 2) this.nPlayers--;
    // if (this.nPlayers < 3) this.nPlayers = 3;
    this.generateMap(this.nPlayers);
    const timer = 1000;
    this.socket.emit('timer', { timer });
    setTimeout(() => {
      if (this.isPaused) this.run();
    }, timer + 1000);
  }

  public reset() {
    this.nPlayers = GameTools.getRandomArbitrary(3, 6);
    // this.nBots = this.nPlayers;
    this.generateMap(this.nPlayers);
    while (this.bots.length != 0) {
      this.bots.pop();
    }
    // this.spawnBots(this.nBots);
  }

  @Expose()
  public get isPaused() {
    return !this.interval;
  }

  public get ballsNetScheme() {
    return this.balls.map((b) => b.netScheme);
  }

  public get paddlesNetScheme() {
    return this.paddles
      .map((b) => b.netScheme)
      .map((b, i) => ({ ...b, name: i }));
  }

  public get powersNetScheme() {
    return this.powers.map((p) => p.netScheme);

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
      wallWith: this.walls[0].width,
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
          break;
        }
      }

      // Ball Collide with powers
      for (let pIdx = 0; pIdx < this.powers.length; pIdx++) {
        const power: Power = this.powers[pIdx];
        if (power.collideWithBall(currBall)) {
          power.effect(currBall);
          this.powers.splice(pIdx, 1);
          console.log('removing power', this.powers.length);
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
    this.timeElapsed += 1 / FRAME_RATE;
    this.ballsCollides();
    this.runPhysics();
    this.runBots();
    this.socket.emit('gameUpdate', this.networkState);
  }

  public get socket() {
    return this.lobby.sock;
  }
}
