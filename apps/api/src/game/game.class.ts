/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   game.class.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/13 03:00:00 by adda-sil          #+#    #+#             */
/*   Updated: 2022/06/30 14:34:35 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import Lobby from './lobby.class';
import { Server, Socket } from 'socket.io';
import Redis from 'ioredis';
import RedisBridge from './redis.bridge';
import Store from 'redis-json';
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

import Ball from './ball.class';

import Paddle from './paddle.class';

import GameTools from './gametools.class';

const FRAME_RATE = 30;


export default class Game {
  lobby: Lobby;
  socket: Server;
  store: Store;

  balls: Ball[] = [];
  nPlayers: number;
  paddles: Paddle[] = [];
  speed = 10;
  edges: any;
  map: PolygonMap;

  timeElapsed = 0;
  interval: NodeJS.Timer;

  constructor(socket: Server, store: Store, lobby: Lobby) {
    this.lobby = lobby;
    this.socket = socket;
    this.store = store;
    // this.run();
    this.socket.on('PaddleUpdate', this.updatePaddle);
    this.nPlayers = 16;
    this.generateMap(this.nPlayers);
  }

  addBall() {
    const ball = new Ball(this.map.center);
    ball.setAngle(angleToRadians(this.map.angles[1]));
    // ball.setAngle(GameTools.getRandomFloatArbitrary(0, Math.PI * 2));
    ball.findTarget(this.map.edges);
    this.balls.push(ball);
  }

  generateMap(nPlayers: number) {
    this.balls = [];
    this.timeElapsed = 0;
    console.log('Generating a new map');
    // console.log('Edges', this.edges);
    // this.edges = new Polygon(polygonRegular(nEdges, 2000, [50, 50]))
    this.map = new PolygonMap(nPlayers === 2 && 4 || nPlayers);
    const playerEdges =
      nPlayers == 2 ? [this.map.edges[0], this.map.edges[2]] : this.map.edges;
    this.paddles = playerEdges.map((line, idx) => {
      return new Paddle(line, idx, 0.4);
    });
    this.addBall();
    this.socket.emit('mapChange', this.networkMap);
    this.socket.emit('gameUpdate', this.networkState);
  }

  run() {
    // this.generateMap(this.nPlayers);
    // this.socket.emit('mapChange', this.networkMap);
    this.interval = setInterval(() => this.tick(), 1000 / FRAME_RATE);
  }
  stop() {
    clearInterval(this.interval);
    this.interval = null;
  }

  updatePaddle(evt: string) {
    if (evt === 'ArrowUp') {
      this.paddles[0].ratio -= 0.1;
    } else if (evt === 'ArrowDown') {
      this.paddles[0].ratio += 0.1;
      // }
    }
  }

  updatePositionPaddles({ y }) {
    // this.paddles[0].pos.y = y;
  }

  updatePaddlePercent(percent: number) {
    this.paddles.forEach((paddle) => {
      paddle.updatePercentOnAxis(percent);
    });
    // if (this.isPaused) debounce(
    //   this.socket.emit('gameUpdate', this.networkState),
    //   500
    // );
  }


  runPhysics() {
    this.balls.forEach((ball) => {
      if (ball.targetDistance <= ball.radius) {

        if (this.nPlayers == 2 && ball.target.index % 2) {
          const incidenceAngleDeg = angleToDegrees(ball.angle);
          const edge = this.map.edges[ball.target.index];
          const surfaceAngleDeg = lineAngle(edge); //paddle.angle;
          const newDegree = angleReflect(incidenceAngleDeg, surfaceAngleDeg);
          const newAngle = angleToRadians(newDegree);
          ball.setAngle(newAngle);
          ball.findTarget(this.map.edges);
        } else {
          // en 1v1 il y a deux murs en plus, c'est un trick pour pas que ca bug mais c'est moche, a rework
          const idx =
            this.nPlayers === 2 && ball.target.index === 2
              ? 1
              : ball.target.index;
          const paddle = this.paddles[idx];
          const paddleTouchTheBall = (pointOnLine as any)(
            ball.target.hit,
            paddle.line,
            1,
          );
          if (paddleTouchTheBall) {
            const incidenceAngleDeg = angleToDegrees(ball.angle);
            // this.verticles =
            const surfaceAngleDeg = paddle.angle; //paddle.angle;
            let newDegree = angleReflect(incidenceAngleDeg, surfaceAngleDeg);
            // const newAngle = angleToRadians(newDegree);

            /**
            * @TODO Ajouter a cet angle un % suivant ou on tape sur a raquette
            * Pour ca il faut d'abord trouver ou la ball a toucher sur la raquette,
            * donc changer paddleTouchTheBall = poitOnLine ou modifier comme on a fait avec lineIntersection
            */

            /**
             * Je crois que c'est gucci
             */

            let l1 = lineLength([[...paddle.line[0]], [ball.position.x, ball.position.y]]);
            let l2 = lineLength([[...paddle.line[1]], [ball.position.x, ball.position.y]]);
            let pc1 = GameTools.percentage(l2, lineLength([[...paddle.line[1]], [...paddle.line[0]]]));
            let pc2 = GameTools.percentage(l1, lineLength([[...paddle.line[1]], [...paddle.line[0]]]));

            console.log("diff", pc1 - pc2, pc1, pc2);
            console.log("pre deg", newDegree);
            newDegree += ((pc1 - pc2) / 100) * paddle.bounceAngle;
            console.log("final deg", newDegree);
            const newAngle = angleToRadians(newDegree);
            // ball.speed *= 1.1;
            ball.setAngle(newAngle);
            ball.findTarget(this.map.edges);
          } else {
            this.reduce();
          }
        }
      }
      ball.move();
    });
  }

  public reduce() {
    this.stop();
    this.nPlayers -= 1;
    if (this.nPlayers < 2) this.nPlayers = 2;
    this.generateMap(this.nPlayers);
    if (this.isPaused) setTimeout(() => {
        if (this.isPaused) this.run();
      }, 3000);
  }

  public reset() {
    this.nPlayers = 8;
    this.generateMap(this.nPlayers);
  }
  // Getters
  public get isPaused() {
    return !this.interval;
  }

  public get ballsNetScheme() {
    return this.balls.map(b => b.netScheme);
  }

  public get paddlesNetScheme() {
    return this.paddles
      .map(b => b.netScheme)
      .map((b, i) => ({ ...b, name: i }))
  }

  public get networkState() {
    return {
      balls: this.ballsNetScheme,
      paddles: this.paddlesNetScheme,
    };
  }
  public get networkMap() {
    return {
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

  public tick() {
    this.timeElapsed += 1 / FRAME_RATE;
    // console.log(this.timeElapsed);
    // if (this.timeElapsed > 10 * this.balls.length) this.addBall();
    this.runPhysics();
    this.socket.emit('gameUpdate', this.networkState);
  }
}
