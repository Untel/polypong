/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   game.class.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: edal--ce <edal--ce@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/13 03:00:00 by adda-sil          #+#    #+#             */
/*   Updated: 2022/09/08 22:07:42 by edal--ce         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import Lobby from './lobby.class';
import { Bot } from '.';
import {
  Line,
  lineLength,
  lineMidpoint,
  Point,
} from 'geometric';
import PolygonMap from './polygon.class';
import { Power, PowerList } from './power.class';
import { Ball, Wall, Paddle } from '.';
import { shuffle } from 'lodash';
import GameTools from './gametools.class';
import Player from './player.class';
import { Exclude, Expose } from 'class-transformer';
import { Logger } from '@nestjs/common';

export const FRAME_RATE = 120;
const TEST_MODE = false;

export enum MODE {
  Coalition = 'coalition',
  Battleground = 'battleground',
}

export class Finalists {
  scores: number[] = [0, 0];
  type: number;
  players: Player[] | Bot[] | [];

  constructor(players) {
    this.players = players;
  }

  public gameDone(targetScore: number, gapPoints = 2) {
    console.log('scores says', this.scores);
    const absdiff = Math.abs(this.scores[0] - this.scores[1]);
    let ret;
    if (absdiff < gapPoints) ret = false;
    else if (this.scores[0] >= targetScore || this.scores[1] >= targetScore)
      ret = true;
    else ret = false;
    return ret;
  }

  public wallGotGoaled(wall: Wall) {
    const compare = wall.bot === undefined ? wall.player : wall.bot;
    if (compare === this.players[0]) this.scores[1]++;
    else if (compare === this.players[1]) this.scores[0]++;
  }
}

export class Participant {
  isBot: boolean;
  ref: Bot | Player;
  score: number;
  constructor(ref: Bot | Player, bot = true) {
    this.ref = ref;
    this.isBot = bot;
    this.score = 0;
  }

  public get netScheme() {
    const t: Point = lineMidpoint(this.ref.wall.line);
    return { x: t[0], y: t[1], value: this.score };
  }
}
export default class Game {
  lobby: Lobby;
  balls: Ball[] = [];
  players: Map<number, Player> = new Map();
  bots: Bot[];
  paddles: Paddle[] = [];
  walls: Wall[] = [];
  powers: Power[] = [];
  map: PolygonMap;
  mode: MODE = MODE.Battleground;
  finaleScore = [0, 0];
  timeElapsed = 0;
  finalePoints = 1;
  participants: Participant[] = [];
  finalists: Finalists | null;
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
    this.finalists = null;
    this.lobby = lobby;
    this.bots = lobby.bots.map((v) => new Bot(v));
    this.players = new Map(this.lobby.players);
    this.bots.forEach((b) => {
      this.participants.push(new Participant(b, true));
    });
    this.players.forEach((p) => {
      this.participants.push(new Participant(p, false));
    });
    this.finalePoints = lobby.finalePoints;
    this.newRound(7);
    // this.finalists = null;
    if (this.nPlayers === 2) this.registerFinalists();
  }

  logger = new Logger('Game');

  addBall(
    hotBall = false,
    angle = GameTools.getRandomFloatArbitrary(0, Math.PI * 2),
  ) {
    const ball = new Ball(this, this.map.center.clone());
    ball.setAngle(angle);
    ball.findTarget();
    if (hotBall) ball.unFreeze();
    this.balls.push(ball);
  }

  generateMap() {
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
    this.bots.forEach((b) => (b.tasks = []));
    const fragAngle = (Math.PI * 2) / this.nPlayers;
    for (let i = 0; i < this.nPlayers; i++) {
      // let ang = fragAngle * i + fragAngle / 2;
      const ang = GameTools.getRandomFloatArbitrary(
        fragAngle * i,
        fragAngle * (i + 1),
      );
      this.addBall(true, ang);
    }
    this.socket.emit('mapChange', this.mapNetScheme);
    this.socket.emit('gameUpdate', this.networkState);
    if (this.nPlayers === 2) this.socket.emit('score', this.scoreNetScheme);
  }

  run() {
    this.stop();
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
    // console.log("finalists ?", (this.finalists !== null));
    this.generateMap();
    this.socket.emit('mapChange', this.mapNetScheme);
    this.resume(timer);
  }

  resume(timer = 5) {
    console.log('New round', this.players.size, this.bots.length);
    this.paused = true;
    // eslint-disable-next-line prettier/prettier
    this.logger.log(
      `&&&&&&&& RESUME this.isStopped = ${this.isStopped} &&&&&&&`,
    );
    if (this.isStopped) this.run();
    // eslint-disable-next-line prettier/prettier
    this.logger.log(
      `&&&&&&&& After this.run, this.isStopped = ${this.isStopped} &&&&&&&`,
    );
    clearInterval(this.sayInterval);
    this.sayInterval = setInterval(() => {
      timer -= 1;
      if (timer === 0) {
        this.socket.emit('message', 'Goooo ooo ooo o o o o o o');
        this.paused = false;
        this.run();
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
    this.balls.forEach((ball) => {
      if (ball.stopped) return;
      const dtc = lineLength([
        [ball.position.x, ball.position.y],
        [this.map.center.x, this.map.center.y],
      ]);

      const testDist: number = lineLength([
        [this.map.center.x, this.map.center.y],
        this.map.edges[0][0],
      ]);
      if (testDist != 0 && dtc > testDist * 1.1 && dtc < testDist * 1.3) {
        // console.log('Ded ball :', dtc);
        this.balls.forEach((e) => {
          if (e !== ball) e.stop();
        });
      } else if (dtc >= 70) {
        this.reduce(ball.target?.wall);
      }
      const wall = ball.target?.wall;
      if (!wall?.paddle || TEST_MODE) {
        const test: boolean = GameTools.lineCircleCollision(
          wall.line,
          ball,
          [0, 0],
        );
        if (test) ball.bounceTargetWall();
      } else if (wall) {
        const impact: Point = [0, 0];
        const test: boolean = GameTools.wallBallCollision(
          wall.paddle.line,
          ball,
          impact,
        );
        if (test) {
          ball.bouncePaddle(wall.paddle, impact);
        }
      }
      ball.move();
    });
  }

  runBots() {
    this.bots.forEach((e) => {
      e.think();
    });
  }

  public get ended() {
    this.logger.log('--------------- ended -------------');
    this.logger.log(`this.players.size = ${this.players.size}`);
    this.logger.log(`this.nPlayers = ${this.nPlayers}`);
    //return this.nPlayers === 1 || this.players.size === 0;
    // if there's still at least one human player
    if (this.players.size >= 1) {
      this.logger.log('still a human left');
      // if there's still at least someone else to play with (human or bot)
      if (this.nPlayers >= 2) {
        this.logger.log('still someone else to play with');
        return false;
      }
    }
    this.logger.log('no humans left');
    return true;
  }

  killPlayer(player: Player) {
    this.logger.log('===============killPlayer============');
    // this.logger.log('player = ', player.user.email);
    this.stop();
    // eslint-disable-next-line prettier/prettier
    this.logger.log(
      `BEFORE players.delete, players.size = ${this.players.size}`,
    );
    this.logger.log(`BEFORE players.delete, nPlayers = ${this.nPlayers}`);
    console.log('player is', player);
    this.players.delete(player.user.id);
    // eslint-disable-next-line prettier/prettier
    this.logger.log(
      `AFTER players.delete, players.size = ${this.players.size}`,
    );
    this.logger.log(`AFTER players.delete, nPlayers = ${this.nPlayers}`);
    this.lobby
      .createPlayerRank(Object.assign({}, player), this.nPlayers)
      .then();
  }

  registerFinalists() {
    const collection = [];
    this.players.forEach((p) => {
      collection.push(p);
    });
    this.bots.forEach((p) => {
      collection.push(p);
    });
    this.finalists = new Finalists(collection);
  }

  killWall(wall: Wall) {
    this.participants = this.participants.filter((b) => {
      if (b.isBot) return b.ref !== wall.bot;
      else return b.ref !== wall.player;
    });
    if (wall.bot !== undefined) {
      this.logger.log('Bot getting killed');
      this.bots = this.bots.filter((b) => b !== wall.bot);
    } else if (wall.player !== undefined) {
      this.logger.log('Player getting killed');
      this.killPlayer(wall.player);
    } else {
      console.log("didn't kill that one");
    }
  }

  public reduce(wall: Wall) {
    this.stop();
    this.logger.log('~~~~~~~~~~~~~~reduce~~~~~~~~~~~~~~');
    //If we're more than two than the game will still go on afterwards
    if (this.nPlayers > 2) {
      this.killWall(wall);
      if (this.nPlayers === 2) {
        console.log('Only two left, time for baston');
        this.registerFinalists();
      }
      return this.newRound(); //So we ret newRound
    }
    //Otherwise let's look at points
    this.finalists.wallGotGoaled(wall);

    if (!this.finalists.gameDone(this.finalePoints)) {
      this.logger.log(
        `Score is, ${this.finalists.scores}, entertain us some more`,
      );
      return this.newRound();
    }
    //Now this is safe to assume that's the end, get rid of the looser
    this.killWall(wall);
    this.logger.log('Winner getting killed');
    this.players.forEach((element) => {
      this.killPlayer(element);
    });
    return this.lobby.service.closeLobby(this.lobby);
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
  public get scoreNetScheme() {
    if (this.finalists !== null) return this.finalists.scores;
    return [];
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
      scores: this.scoreNetScheme,
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
          currBall.findTarget();
          compared.findTarget();
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
          // this.socket.emit('removePower', power.netScheme, pIdx);
        }
      }
    }
  }

  public addRandomPower() {
    const powerClass =
      PowerList[GameTools.getRandomArbitrary(0, PowerList.length)];
    const powerObj: Power = new powerClass(this, this.map.randomPosition());
    this.powers.push(powerObj);
    // console.log(
    //   'Adding new power',
    //   powerObj.name,
    //   Object.keys(powerObj),
    //   typeof powerObj,
    // );
    // this.socket.emit('power', (this.powers.indexOf(powerObj), powerObj.netScheme))
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
