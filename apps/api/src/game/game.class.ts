/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   game.class.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: edal--ce <edal--ce@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/13 03:00:00 by adda-sil          #+#    #+#             */
/*   Updated: 2022/06/27 17:16:40 by edal--ce         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import Lobby from './lobby.class';
import { Server, Socket } from 'socket.io';
import Redis from 'ioredis';
import RedisBridge from './redis.bridge';
import Store from 'redis-json';
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
    this.nPlayers = 2;
    this.generateMap(this.nPlayers);
  }

  addBall() {
    const ball = new Ball();
    ball.setAngle(GameTools.getRandomFloatArbitrary(0, Math.PI * 2));
    ball.findTarget(this.map.edges);
    this.balls.push(ball);
  }

  generateMap(nPlayers: number) {
    this.balls = [];
    this.timeElapsed = 0;
    console.log('Generating a new map');
    const nEdges = (nPlayers > 2 && nPlayers) || 4;
    // console.log('Edges', this.edges);
    // this.edges = new Polygon(polygonRegular(nEdges, 2000, [50, 50]))
    this.map = new PolygonMap(nEdges);
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
    this.socket.emit('mapChange', this.networkMap);
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
  }

  distance(n1: number, n2: number) {
    if (n1 > n2)
      return n1 - n2
    return n2 - n1;
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
            const surfaceAngleDeg = paddle.angle; //paddle.angle;
            let newDegree = angleReflect(incidenceAngleDeg, surfaceAngleDeg);
            // const newAngle = angleToRadians(newDegree);

            // console.log('new angle ', newAngle);
            console.log('paddle ', paddle)
            console.log('paddleTouchedTheBall, ', paddleTouchTheBall);
            /**
             * @TODO Ajouter a cet angle un % suivant ou on tape sur a raquette
             * Pour ca il faut d'abord trouver ou la ball a toucher sur la raquette,
             * donc changer paddleTouchTheBall = poitOnLine ou modifier comme on a fait avec lineIntersection
             */
            let l1 = lineLength([[paddle.line[0][0], paddle.line[0][1]], [ball.position.x, ball.position.y]]);
            let l2 = lineLength([[paddle.line[1][0], paddle.line[1][1]], [ball.position.x, ball.position.y]]);
            // let min = 0;
            // let max = 20;
            // console.log(max)
            console.log("l1 lenght", l1);
            console.log("l2 lenght", l2);
            console.log("ratio 1", l1 / l2);
            console.log("ratio 2", l2 / l1);
            console.log("old deg", newDegree)
            if (Math.floor(l1 / l2) === Math.floor(l2 / l1)) {
              console.log("center")
            }
            else if (l1 / l2 < l2 / l1) {
              console.log("right is close")
              newDegree += 35 //% paddle.angle;
            }
            else {
              newDegree -= 35// % paddle.angle;

              console.log("left is closer")
            }
            console.log("new deg", newDegree)

            // let final = ((l1 / l2) - min) / (max - min)
            // let final2 = ((l2 / l1) - min) / (max - min)
            // // let final2
            // console.log('final', final);
            // console.log('final2', final2)

            // let tmpY: number = paddle.line[0][1] * paddle.line[1][1] / ball.position.y;

            // let xPercent = paddle.line[0][0] > paddle.line[1][0] ? tmpX / paddle.line[0][0] : tmpX / paddle.line[1][0];
            // let yPercent = paddle.line[0][1] > paddle.line[1][1] ? tmpX / paddle.line[0][1] : tmpY / paddle.line[1][1];

            // console.log('y percent', yPercent);

            // console.log('x percent', xPercent);
            // if (paddle.line[0][0] > paddle.line[1][0])
            //   console.log(tmpX / paddle.line[0][0]);
            // else
            // //   console.log(tmpX / paddle.line[1][0]);
            // if (paddle.line[0][1] > paddle.line[1][1])
            //   console.log(tmpY / paddle.line[0][1]);
            // else
            //   console.log(tmpY / paddle.line[1][1]);

            // console.log(tmpY / paddle.line[0][1]);
            // let tmpX: number = paddle.line[0][0] * paddle.line[1][0] / ball.position.x;
            // let tmpY: number = paddle.line[0][1] * paddle.line[1][1] / ball.position.y;

            // console.log('tmpx', tmpX);

            // console.log('tmpy', tmpY);

            // console.log('centerY', paddleCenter);
            // console.log('ratio ', paddleCenter - ballCenter);
            // ball.speed *= 1.1;

            //Comment and uncomment above this to remove ball response to pos on paddle
            const newAngle = angleToRadians(newDegree);

            ball.setAngle(newAngle);
            ball.findTarget(this.map.edges);
          } else {
            this.nPlayers -= 1;
            if (this.nPlayers < 2) this.nPlayers = 2;
            this.generateMap(this.nPlayers);
          }
        }
      }
      ball.move();
    });
  }

  public reset() {
    this.balls.forEach(e => {
      e.reset();
      e.findTarget(this.map.edges);
    });
  }
  // Getters
  public get isPaused() {
    return !this.interval;
  }
  public get networkState() {
    return {
      edges: this.map.edges,
      balls: this.balls.map((b) => b.netScheme),
      paddles: this.paddles.map((p, i) => ({ name: i, ...p.netScheme })),
    };
  }
  public get networkMap() {
    return {
      edges: this.map.verticles,
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
    // if (this.timeElapsed > 5 * this.balls.length) this.addBall();
    this.runPhysics();
    this.socket.emit('gameUpdate', this.networkState);
  }
}
