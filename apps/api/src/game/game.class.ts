/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   game.class.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/13 03:00:00 by adda-sil          #+#    #+#             */
/*   Updated: 2022/06/23 02:04:11 by adda-sil         ###   ########.fr       */
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

import { polygonOffset } from 'polygon';
import PolygonMap from './polygon.class';

function crossProduct(a: Vector, b: Vector) {
  return a.x * b.y - b.x * a.y;
}
function sqDist(a: Vector, b: Vector) {
  return (a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y);
}

const collider = new Collider2d();

function line_intersect(x1, y1, x2, y2, x3, y3, x4, y4)
{
    var ua, ub, denom = (y4 - y3)*(x2 - x1) - (x4 - x3)*(y2 - y1);
    if (denom == 0) {
        return null;
    }
    ua = ((x4 - x3)*(y1 - y3) - (y4 - y3)*(x1 - x3))/denom;
    ub = ((x2 - x1)*(y1 - y3) - (y2 - y1)*(x1 - x3))/denom;
    return {
        x: x1 + ua * (x2 - x1),
        y: y1 + ua * (y2 - y1),
        seg1: ua >= 0 && ua <= 1,
        seg2: ub >= 0 && ub <= 1
    };
}
class Ball extends Circle {
  speed = 1;
  direction: Vector;
  angle: number;
  // target: {
  //   hit: Point,
  //   index: number,
  // };
  target: any;
  targetInfo: any;

  constructor(startPos: Vector = new Vector(0, 0), radius = 3) {
    super(startPos, radius);
    // this.setAngle(0);
    // console.log("11", this.position);
    // this.move();
    this.reset();
    // console.log("11", this.position);
  }

  clone() {
    const newBall = new Ball(new Vector(this.position.x, this.position.y), this.radius);
    newBall.setAngle(this.angle);
    return newBall;
  }

  setAngle(angle: number) {
    this.angle = angle % (Math.PI * 2);
    const x = Math.cos(angle) * this.speed;
    const y = Math.sin(angle) * this.speed;
    this.direction = new Vector(x, y);
  }

  findTarget(edges: Array<Line>) {
    const tx = Math.cos(this.angle) * 100;
    const ty = Math.sin(this.angle) * 100;
    // const trajectory = new Vector(tx, ty);

    const fakeBall = this.clone();
    for (let i = 0; i < 50; i++) fakeBall.move();

    const line: Line = [
      [this.position.x, this.position.y],
      [fakeBall.position.x, fakeBall.position.y],
      // [tx, ty],
    ];

    const [[x1, y1], [x2, y2]] = line;

    for (let i = 0; i < edges.length; i++) {
      const edge: Line = edges[i];

      const [[x3, y3], [x4, y4]] = edge;
      const intersection = line_intersect(x1, y1, x2, y2, x3, y3, x4, y4);

      console.log("Intersec is", intersection);
      if (intersection && intersection.seg1 && intersection.seg2) {
        this.target = {
          hit: [intersection.x, intersection.y],
          edge,
          index: i,
        };
        this.targetInfo = {
          edgeIndex: i,
          edge,
          ...intersection
        };
        break ;
      }
      this.target = { hit: [0, 0], index: 0 };
      this.targetInfo = null;
    }
  }

  move() {
    this.position.x = this.position.x + this.direction.x;
    this.position.y = this.position.y + this.direction.y;
  }

  reset(position: Vector = new Vector(0, 0)) {
    // this.setAngle(getRandomFloatArbitrary(0, Math.PI * 2));
    this.setAngle(Math.PI / 4 * 3);
    this.position.x = position.x;
    this.position.y = position.y;
  }

  public get targetDistance() {
    const length = lineLength([
      [this.position.x, this.position.y],
      this.target.hit,
    ]);
    return length;
  }

  public get point(): Point {
    return [this.position.x, this.position.y];
  }

  public get netScheme() {
    return {
      position: {
        x: this.position.x,
        y: this.position.y,
      },
      radius: this.radius,
      target: {
        ...this.target,
        hit: {
          x: this.target.hit[0],
          y: this.target.hit[1],
        },
      },
      targetInfo: this.targetInfo,
      targetDistance: this.targetDistance,
    };
  }
}

const colors = ['red', 'blue', 'magenta', 'purple', 'green'];
class Paddle {
  color: string;
  line: Line;
  interpolationStart: Function;
  interpolationEnd: Function;
  width: number;
  angle: number;
  index: number;

  constructor(axis: Line, index: number, width = 0.2) {
    this.width = width;
    this.index = index;
    this.color = colors[index % colors.length];
    const lw = lineLength(axis);
    const pw = lw * width;
    this.angle = lineAngle(axis);

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
      color: this.color,
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
    this.map = new PolygonMap(4);
    this.balls[0] = new Ball();
    this.balls[0].findTarget(this.map.edges);

    this.paddles = this.map.edges.map((line, idx) => {
      return new Paddle(line, idx, 0.4);
    });
    this.socket.emit('mapChange', this.networkMap);
    this.socket.emit('gameUpdate', this.networkState);
  }

  run() {
    this.generateMap();
    this.socket.emit('mapChange', this.networkMap);
    this.interval = setInterval(() => this.tick(), 1000 / 30);
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
  }

  runPhysics() {
    this.balls.forEach((ball) => {
      if (ball.targetDistance <= ball.radius) {
        const paddle = this.paddles[ball.target.index];
        const edge = this.map.edges[ball.target.index];
        const boundSegment = paddle.line;
        const paddleTouchTheBall = (pointOnLine as any)(ball.target.hit, boundSegment, 1);
        console.log("Hitted side ", ball.target.index, ball.target.hit, paddleTouchTheBall);
        console.log("Bound segment", boundSegment);
        if (paddleTouchTheBall) {
          const incidenceAngle = angleToDegrees(ball.angle);
          console.log("🚀 ~ file: game.class.ts ~ line 304 ~ Game ~ this.balls.forEach ~ incidenceAngle", incidenceAngle)
          const surfaceAngle = lineAngle(boundSegment) ;//paddle.angle;
          console.log("🚀 ~ file: game.class.ts ~ line 306 ~ Game ~ this.balls.forEach ~ surfaceAngle", surfaceAngle)
          const newDegree = angleReflect(incidenceAngle, surfaceAngle);
          console.log("🚀 ~ file: game.class.ts ~ line 308 ~ Game ~ this.balls.forEach ~ newDegree", newDegree)
          const newAngle = angleToRadians(newDegree);
          console.log("🚀 ~ file: game.class.ts ~ line 310 ~ Game ~ this.balls.forEach ~ newAngle", newAngle)
          console.log("Reflected by user", ball.target.index, incidenceAngle, surfaceAngle);
          console.log("Degree", newDegree, "became", newAngle);
          ball.setAngle(newAngle);
          ball.findTarget(this.map.edges);

          // ball.setAngle(ball.angle - Math.PI);
        } else {
          ball.reset();
          ball.findTarget(this.map.edges);
        }
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
