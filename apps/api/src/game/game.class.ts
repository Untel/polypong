/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   game.class.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: edal--ce <edal--ce@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/13 03:00:00 by adda-sil          #+#    #+#             */
/*   Updated: 2022/07/11 10:08:43 by edal--ce         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import Lobby from './lobby.class';
import { Server, Socket } from 'socket.io';
import Redis from 'ioredis';
import RedisBridge from './redis.bridge';
import Store from 'redis-json';
import { Bot } from '.';
import { debounce } from 'lodash';
import {
  lineInterpolate,
  polygonRegular,
  lineAngle,
  angleToDegrees,
  pointOnLine,
  pointWithLine,
  Line,
  pointInPolygon,
  angleReflect,
  Point,
  polygonCentroid,
  lineLength,
  lineIntersectsLine,
  angleToRadians,
} from 'geometric';

import { Box, Circle, Polygon, Collider2d, Vector } from 'collider2d';

import PolygonMap from './polygon.class';
import { Power, PowerList } from './power.class';

import { Ball, Wall, Paddle } from '.';

import GameTools from './gametools.class';

const FRAME_RATE = 30;

const col = new Collider2d();
// col.testCirclePolygon
// col.testPolygonCircle

const TEST_MODE = true;

export enum MODE {
  Coalition = 'coalition',
  Battleground = 'battleground',
}
export default class Game {
  lobby: Lobby;
  socket: Server;
  store: Store;

  balls: Ball[] = [];
  nBall: number = 1;
  bots: Bot[] = [];
  nPlayers: number;
  nBots: number;
  paddles: Paddle[] = [];
  walls: Wall[] = [];
  powers: Power[] = [];
  speed = 10;
  edges: any;
  map: PolygonMap;
  mode: MODE = MODE.Battleground;

  timeElapsed = 0;
  interval: NodeJS.Timer;
  intervalPowers: NodeJS.Timer;

  constructor(socket: Server, store: Store, lobby: Lobby) {
    this.lobby = lobby;
    this.socket = socket;
    this.store = store;
    this.nPlayers = 5;
    this.nBots = 4;
    this.generateMap(this.nPlayers);
    this.spawnBots(this.nBots);
  }

  addBall() {
    const ball = new Ball(new Vector(this.map.center.x, this.map.center.y));
    // ball.setAngle(angleToRadians(this.map.angles[1]));
    ball.setAngle(GameTools.getRandomFloatArbitrary(0, Math.PI * 2));
    ball.findTarget(this.walls);
    this.balls.push(ball);
  }


  generateMap(nPlayers: number) {
    this.balls = [];
    this.powers = [];
    this.timeElapsed = 0;
    // console.log('Generating a new map');
    // console.log('Edges', this.edges);
    // this.edges = new Polygon(polygonRegular(nEdges, 2000, [50, 50]))
    this.map = new PolygonMap((nPlayers === 2 && 4) || nPlayers);
    this.paddles = [];
    this.walls = this.map.edges.map((line: Line, index) => {
      let paddle = null;
      if (nPlayers > 2 || !(index % 2)) {
        paddle = new Paddle(line, index);
        this.paddles.push(paddle);
      }
      return new Wall(line, paddle);
    });
    // this.paddles = playerEdges.map((line, idx) => {
    //   return new Paddle(line, idx, 0.4);
    // });
    for (let i = 0; i < this.nBall; i++)
      this.addBall();
    this.socket.emit('mapChange', this.networkMap);
    this.socket.emit('gameUpdate', this.networkState);
  }

  spawnBots(botNb: number) {

    for (let i = 0; i < botNb; i++) {
      const tmp: Bot = new Bot(this.walls[i], i)
      this.bots.push(tmp);
    }
  }

  run() {
    // this.generateMap(this.nPlayers);
    // this.socket.emit('mapChange', this.networkMap);
    this.interval = setInterval(() => this.tick(), 1000 / FRAME_RATE);
    this.intervalPowers = setInterval(() => this.addRandomPower(), 5000);
  }
  stop() {
    clearInterval(this.interval);
    clearInterval(this.intervalPowers);
    this.interval = null;
    this.intervalPowers = null;
  }

  updatePaddlePercent(percent: number) {
    // console.log("here is percent", percent);
    // this.paddles.forEach((paddle) => {
    this.paddles[this.paddles.length - 1].updatePercentOnAxis(percent)
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
            if (TEST_MODE || this.mode === MODE.Coalition && paddle.color === ball.lastHitten.color) {
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
    this.bots.forEach(e => {
      e.think();
    })
  }

  public reduce() {
    this.stop();
    // if (this.nPlayers > 4)
    if (this.nPlayers > 2)
      this.nPlayers--;
    // if (this.nPlayers < 3) this.nPlayers = 3;
    this.generateMap(this.nPlayers);
    const timer = 1000;
    this.socket.emit('timer', { timer });
    setTimeout(() => {
      if (this.isPaused) this.run();
    }, timer + 1000);
  }

  public reset() {
    // this.nPlayers = 1;
    this.generateMap(this.nPlayers);
    while (this.bots.length != 0) {
      this.bots.pop();
    }
    this.spawnBots(this.nBots);

  }
  // Getters
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

  public get networkState() {
    return {
      balls: this.ballsNetScheme,
      paddles: this.paddlesNetScheme,
    };
  }
  public get networkMap() {
    return {
      walls: this.walls.map((w) => w.netScheme),
      wallWith: this.walls[0].width,
      angles: this.map.angles,
      verticles: this.map.verticles,
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
          console.log("removing power", this.powers.length);
          this.socket.emit('powers', this.powers.map((p) => p.netScheme));
        }
      }
    }
  }

  public addRandomPower() {
    const powerClass = PowerList[GameTools.getRandomArbitrary(0, PowerList.length)]
    const powerObj: Power = new powerClass(this, this.map.randomPosition());
    this.powers.push(powerObj);
    console.log("Adding new power", powerObj.name, Object.keys(powerObj), typeof powerObj);
    this.socket.emit('powers', this.powers.map((p) => p.netScheme));
  }

  public tick() {
    this.timeElapsed += 1 / FRAME_RATE;
    this.ballsCollides();
    this.runPhysics();
    this.runBots();
    this.socket.emit('gameUpdate', this.networkState);
  }
}
