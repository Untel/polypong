/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   game.class.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: edal--ce <edal--ce@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/13 03:00:00 by adda-sil          #+#    #+#             */
/*   Updated: 2022/07/03 15:35:33 by edal--ce         ###   ########.fr       */
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

import { Ball, Wall, Paddle } from '.';

import GameTools from './gametools.class';

const FRAME_RATE = 30;

export default class Game {
  lobby: Lobby;
  socket: Server;
  store: Store;

  balls: Ball[] = [];
  nPlayers: number;
  paddles: Paddle[] = [];
  walls: Wall[] = [];
  speed = 10;
  edges: any;
  map: PolygonMap;

  timeElapsed = 0;
  interval: NodeJS.Timer;

  constructor(socket: Server, store: Store, lobby: Lobby) {
    this.lobby = lobby;
    this.socket = socket;
    this.store = store;
    this.nPlayers = 12;
    this.generateMap(this.nPlayers);
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
    this.timeElapsed = 0;
    // console.log('Generating a new map');
    // console.log('Edges', this.edges);
    // this.edges = new Polygon(polygonRegular(nEdges, 2000, [50, 50]))
    this.map = new PolygonMap((nPlayers === 2 && 4) || nPlayers);
    const playerEdges =
      nPlayers == 2 ? [this.map.edges[0], this.map.edges[2]] : this.map.edges;
    this.paddles = [];
    this.walls = this.map.edges.map((line: Line, index) => {
      let paddle = null;
      if (nPlayers > 2 || index % 2) {
        paddle = new Paddle(line, index, 1);
        this.paddles.push(paddle);
      }
      return new Wall(line, paddle);
    });
    // this.paddles = playerEdges.map((line, idx) => {
    //   return new Paddle(line, idx, 0.4);
    // });
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

      let collisionCheck: boolean;

      const idx =
        this.nPlayers === 2 && ball.target.index === 2
          ? 1
          : ball.target.index;
      const paddle = this.paddles[idx];
      // console.log("ball target", ball.target.index)
      const dist: number = GameTools.pDistance(ball.position.x, ball.position.y, paddle.t_axis[0], paddle.t_axis[1])
      const dist2: number = GameTools.pDistance(ball.position.x + ball.direction.x, ball.position.y + ball.direction.y, paddle.t_axis[0], paddle.t_axis[1])
      // console.log("dist to targett line is : ", dist);
      // console.log("ball radius", ball.radius) = 3
      if (dist <= ball.radius) {//|| (dist > ball.radius && dist2  )) {
        // console.log("Collision !");
        if (this.nPlayers == 2 && ball.target.index % 2) {
          const incidenceAngleDeg = angleToDegrees(ball.angle);
          const edge = this.map.edges[ball.target.index];
          const surfaceAngleDeg = lineAngle(edge); //paddle.angle;
          const newDegree = angleReflect(incidenceAngleDeg, surfaceAngleDeg);
          const newAngle = angleToRadians(newDegree);
          ball.setAngle(newAngle);
          ball.findTarget(this.walls);
        } else {
          // en 1v1 il y a deux murs en plus, c'est un trick pour pas que ca bug mais c'est moche, a rework
          // const idx =
          //   this.nPlayers === 2 && ball.target.index === 2
          //     ? 1
          //     : ball.target.index;
          // const paddle = this.paddles[idx];
          const paddleTouchTheBall = (pointOnLine as any)(
            ball.target.hit,
            paddle.line,
            1,
          );
          // console.log("distance is ", dist)
          // console.log("point Padle touched ", paddleTouchTheBall)

          var a: number = dist;

          var c: number = GameTools.distance(ball.position.x, ball.position.y, ball.target.hit[0], ball.target.hit[1]);
          var b: number = Math.sqrt(Math.pow(c, 2) - Math.pow(a, 2));

          var ratio: number;
          // ratio  =
          var ratiox = ball.target.hit[0] - ball.position.x;
          // console.log("ratiox = ", ratiox)
          // var ratioy = ball.target.hit[1] - ball.position.y;
          // console.log("ratioy = ", ratiox)
          // // console.log("a: ", a);
          // // console.log("c: ", c);

          // console.log("It hit: ", b, "before it should have i think");

          // console.log("dist + dx", ball.position.x + b);
          // console.log("dist + dy", ball.position.y + b);
          console.log("paddle angle ", paddle.angle);
          console.log("ball angle ", ball.angle)
          console.log("pos being C : ", ball.position)
          console.log("target being A : ", ball.target.hit)

          console.log("distance to botton part", dist);
          console.log("distance to botton target", GameTools.distance(ball.position.x, ball.position.y, ball.target.hit[0], ball.target.hit[1]));

          let trajy: number = ball.position.y - ball.target.hit[1];
          let trajx: number = ball.position.x - ball.target.hit[0]
          // console.log("traj x", trajx)
          // console.log("traj y", trajy)
          // let x = Math.cos(paddle.angle) * dist
          // let y = Math.sin(paddle.angle) * dist
          // console.log("x :", x, "y :", y)
          // console.log("ratio x ", trajx * (ball.position.x / ball.target.hit[0]))
          // console.log("ratioy ", trajy * (ball.position.y / ball.target.hit[1]))
          // // ball.position.x += trajx * (ball.position.x / ball.target.hit[0]);
          // // ball.position.y += trajy * (ball.position.y / ball.target.hit[1]);
          // console.log("on line final x ", ball.target.hit[0] + (ball.position.x - ball.target.hit[0]) / (ball.position.x / ball.target.hit[0]))
          // console.log("on line final y ", ball.target.hit[1] + (ball.position.y - ball.target.hit[1]) / (ball.position.y / ball.target.hit[1]))
          // console.log("point on line current",pointOnLine())
          // ball.position.x = ball.target.hit[0] + (ball.position.x - ball.target.hit[0]) / (ball.position.x / ball.target.hit[0]);
          // ball.position.y = ball.target.hit[1] + (ball.position.y - ball.target.hit[1]) / (ball.position.y / ball.target.hit[1])
          // console.log("final  : ", ball.position.x + b, ball.position.y + b)

          // ball.position.x += b; 
          // ball.position.y += b;
          // if (dist <= ball.radius) {
          //   console.log("got a hit");
          //   if (paddleTouchTheBall) 
          //     console.log("othe method as well");
          //   else
          //     console.log("other didnt");

          // }
          // console.log()
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
            // console.log("target:  ", ball.target);


            // const l1 = lineLength([
            //   [...paddle.line[0]],
            //   [ball.position.x, ball.position.y],
            // ]);
            // const l2 = lineLength([
            //   [...paddle.line[1]],
            //   [ball.position.x, ball.position.y],
            // ]);
            const l1 = lineLength([
              [...paddle.line[0]],
              [ball.position.x, ball.position.y],
            ]);
            const l2 = lineLength([
              [...paddle.line[1]],
              [ball.position.x, ball.position.y],
            ]);
            const pc1 = GameTools.percentage(
              l2,
              lineLength([[...paddle.line[1]], [...paddle.line[0]]]),
            );
            const pc2 = GameTools.percentage(
              l1,
              lineLength([[...paddle.line[1]], [...paddle.line[0]]]),
            );
            // console.log("pc1 :", pc1)
            // console.log("pc2 :", pc2)

            // console.log('diff', pc1 - pc2, pc1, pc2);
            // console.log('pre deg', newDegree);
            // newDegree += ((pc1 - pc2) / 100) * paddle.bounceAngle;
            // console.log('final deg', newDegree);
            const newAngle = angleToRadians(newDegree);
            // ball.speed *= 1.1;
            ball.setAngle(newAngle);
            ball.findTarget(this.walls);
          } else {
            console.log("reduce");
            this.reduce();
          }
        }
      }
      ball.move();
    });
  }

  public reduce() {
    this.stop();
    // if (this.nPlayers > 4)
    // this.nPlayers--;
    // if (this.nPlayers < 3) this.nPlayers = 3;
    this.generateMap(this.nPlayers);
    const timer = 1000;
    this.socket.emit('timer', { timer });
    setTimeout(() => {
      if (this.isPaused) this.run();
    }, timer + 1000);
  }

  public reset() {
    this.nPlayers = 12;
    this.generateMap(this.nPlayers);
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

  public tick() {
    this.timeElapsed += 1 / FRAME_RATE;
    // console.log(this.timeElapsed);
    // if (this.timeElapsed > 10 * this.balls.length) this.addBall();
    this.runPhysics();
    this.socket.emit('gameUpdate', this.networkState);
  }
}
