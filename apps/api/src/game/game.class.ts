/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   game.class.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/13 03:00:00 by adda-sil          #+#    #+#             */
/*   Updated: 2022/06/22 15:11:55 by adda-sil         ###   ########.fr       */
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
  Line,
  pointInPolygon,
  angleReflect,
  Point,
  polygonCentroid,
  lineLength,
} from 'geometric';

import { Box, Circle, Polygon, Collider2d, Vector } from 'collider2d';

import { polygonOffset } from 'polygon';
import PolygonMap from './polygon.class';

function sqDist(a: Vector, b: Vector) {
  return (a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y);
}

class Ball extends Circle {
  speed = 1;
  direction: Vector;

  constructor(startPos: Vector = new Vector(0, 0), radius = 3) {
    super(startPos, radius);
    this.setAngle(0);
    // console.log("11", this.position);
    this.move();
    // console.log("11", this.position);
  }

  setAngle(angle: number) {
    const x = Math.sin(angle) * this.speed;
    const y = Math.cos(angle) * this.speed;
    console.log('Setting angle', x, y);
    this.direction = new Vector(x, y);
  }

  move() {
    this.position.x = this.position.x + this.direction.x;
    this.position.y = this.position.y + this.direction.y;
  }

  reset(position: Vector = new Vector(0, 0)) {
    this.setAngle(getRandomFloatArbitrary(0, Math.PI * 2));
    this.position.x = position.x;
    this.position.y = position.y;
  }

  //En sah de sah je sais que ca rentre en moins de lignes
  isInside(points: any) {
    const { x, y } = this.position;
    const p1: Vector = new Vector(
      points[points.length - 1][0] - points[0][0],
      points[points.length - 1][1] - points[0][1],
    );
    const p2: Vector = new Vector(
      points[1][0] - points[0][0],
      points[1][1] - points[0][1],
    );
    const pq: Vector = new Vector(x - points[0][0], y - points[0][1]);
    if (!(p1.dot(pq) <= 0 && p2.dot(pq) >= 0)) return false;

    let l = 0,
      r: number = points.length;

    while (r - l > 1) {
      const mid: number = Math.floor((l + r) / 2);
      const cur: Vector = new Vector(
        points[mid][0] - points[0][0],
        points[mid][1] - points[0][1],
      );
      if (cur.dot(pq) < 0) {
        r = mid;
      } else {
        l = mid;
      }
    }

    if (l == points.length - 1) {
      return (
        sqDist(points[0], new Vector(x, y)) <= sqDist(points[0], points[l])
      );
    } else {
      const l_l1: Vector = new Vector(
        points[l + 1][0] - points[l][0],
        points[l + 1][1] - points[l][1],
      );
      const lq: Vector = new Vector(x - points[l][0], y - points[l][1]);
      return l_l1.dot(lq) >= 0;
    }
  }

  public get netScheme() {
    return {
      position: {
        x: this.position.x,
        y: this.position.y,
      },
      radius: this.radius,
    };
  }
}
class Paddle {
  line: Line;
  interpolationStart: Function;
  interpolationEnd: Function;
  width: number;

  constructor(axis: Line, width = 0.2) {
    this.width = width;
    const lw = lineLength(axis);
    const pw = lw * width;

    console.log('Lw', lw, 'pw', pw);
    // On cree un sous line sur laquelle le paddle va pouvoir glisser
    // qui correspond a 1 - width% de la line actuelle (+ width% de taille du Paddle)
    const preInterpolate = lineInterpolate(axis);
    const effectiveAxisStart: Line = [axis[0], preInterpolate(1 - this.width)];
    const effectiveAxisEnd: Line = [preInterpolate(this.width), axis[1]];
    this.interpolationStart = lineInterpolate(effectiveAxisStart);
    this.interpolationEnd = lineInterpolate(effectiveAxisEnd);
    this.updatePercentOnAxis(0.5);
  }

  updatePercentOnAxis(ratio: number) {
    // ratio 0 -> 1

    const newPos = this.interpolationStart(ratio);
    const newPosEnd = this.interpolationEnd(ratio);
    this.line = [newPos, newPosEnd];
  }

  public get netScheme() {
    return {
      line: this.line,
    };
  }
}

export default class Game {
  lobby: Lobby;
  socket: Server;
  store: Store;

  balls: Ball[] = [];
  paddles: Paddle[] = [];
  speed = 10;
  edges: any;
  map: PolygonMap;

  interval: NodeJS.Timer;

  constructor(socket: Server, store: Store, lobby: Lobby) {
    this.lobby = lobby;
    this.socket = socket;
    this.store = store;
    // this.run();
    // this.socket.on('PaddleUpdate', this.updatePaddle);
    this.generateMap();
  }

  generateMap() {
    const nPlayers = getRandomArbitrary(3, 9); //lobby.players.size;
    const nEdges = (nPlayers > 2 && nPlayers) || 4;

    // console.log('Edges', this.edges);
    // this.edges = new Polygon(polygonRegular(nEdges, 2000, [50, 50]))
    this.map = new PolygonMap(nEdges);
    this.balls[0] = new Ball();
    this.paddles = this.map.edges.map((line, idx) => {
      return new Paddle(line, 0.4);
    });
    this.socket.emit('mapChange', this.networkMap);
    this.socket.emit('gameUpdate', this.networkState);
  }

  run() {
    this.generateMap();
    this.socket.emit('mapChange', this.networkMap);
    this.interval = setInterval(() => this.tick(), 1000 / 60);
  }
  stop() {
    clearInterval(this.interval);
    this.interval = null;
  }

  updatePaddle(evt: string) {
    // if (evt === 'ArrowUp' && this.paddles[0].pos.y > 0) {
    //   this.paddles[0].pos.y -= this.speed;
    // } else if (evt === 'ArrowDown' && this.paddles[0].pos.y < 400) {
    //   this.paddles[0].pos.y += this.speed;
    // }
  }

  updatePositionPaddles({ y }) {
    // this.paddles[0].pos.y = y;
  }

  updatePaddlePercent(percent: number) {
    this.paddles.forEach((paddle) => {
      paddle.updatePercentOnAxis(percent);
    });
    this.paddles[0].updatePercentOnAxis(percent);
  }

  runPhysics() {
    // console.log("ball is : ", this.ball)
    this.balls.forEach((ball) => {
      // const pip = pointInPolygon(point, this.map.verticles);
      const pip = ball.isInside(this.map.verticles);
      // let pip = true
      if (!pip) {
        //   console.log("Ball not in polygon");
        ball.direction.x = -ball.direction.x;
        ball.direction.y = -ball.direction.y;
        // ball.move();

        // ball.reset(new Vector(0, 0));
        // return;
        // for (let i = 0; i < this.paddles.length; i++) {
        //   // Not good to handle the hit point
        //   if (pointOnLine(point, this.paddles[i].line)) {
        //     console.log(`Paddle ${i} has been hitten`);
        //     // use it https://observablehq.com/@harrystevens/geometric-anglereflect to reflect the ball
        //     return ;
        //   }
        // }
      }
      ball.move();
    });
  }

  // Getters
  public get isPaused() {
    return !this.interval;
  }
  public get networkState() {
    return {
      balls: this.balls.map((b) => b.netScheme),
      paddles: this.paddles.map((p) => p.netScheme),
    };
  }
  public get networkMap() {
    return {
      edges: this.map.verticles,
    };
  }

  public get id() {
    return `${this.lobby.id}`;
  }

  tick() {
    this.runPhysics();
    this.socket.emit('gameUpdate', this.networkState);
  }
}

function getRandomArbitrary(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}
function getRandomFloatArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}
