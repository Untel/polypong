/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   game.class.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/13 03:00:00 by adda-sil          #+#    #+#             */
/*   Updated: 2022/06/23 04:58:15 by adda-sil         ###   ########.fr       */
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

function line_intersect(x1, y1, x2, y2, x3, y3, x4, y4) {
  const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
  if (denom == 0) {
    return null;
  }
  const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
  const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;
  return {
    x: x1 + ua * (x2 - x1),
    y: y1 + ua * (y2 - y1),
    seg1: ua >= 0 && ua <= 1,
    seg2: ub >= 0 && ub <= 1,
  };
}

function line_intersection(p0_x, p0_y, p1_x, p1_y, p2_x, p2_y, p3_x, p3_y) {
  const s1_x = p1_x - p0_x;
  const s1_y = p1_y - p0_y;
  const s2_x = p3_x - p2_x;
  const s2_y = p3_y - p2_y;

  const s =
    (-s1_y * (p0_x - p2_x) + s1_x * (p0_y - p2_y)) /
    (-s2_x * s1_y + s1_x * s2_y);
  const t =
    (s2_x * (p0_y - p2_y) - s2_y * (p0_x - p2_x)) /
    (-s2_x * s1_y + s1_x * s2_y);

  if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
    return {
      x: p0_x + t * s1_x,
      y: p0_y + t * s1_y,
    };
  }

  return null; // No collision
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
    // console.log("11", this.position);
    // this.move();
    // this.reset();
    // console.log("11", this.position);
  }

  clone() {
    const newBall = new Ball(
      new Vector(this.position.x, this.position.y),
      this.radius,
    );
    newBall.setAngle(this.angle);
    return newBall;
  }

  setAngle(angle: number) {
    this.angle = angle;
    const x = Math.cos(angle) * this.speed;
    const y = Math.sin(angle) * this.speed;
    this.direction = new Vector(x, y);
  }

  findTarget(edges: Array<Line>) {
    const fakeBall = this.clone();
    for (let i = 0; i < 100; i++) fakeBall.move();

    const line: Line = [
      [fakeBall.position.x, fakeBall.position.y],
      // [tx, ty],
      [this.position.x, this.position.y],
    ];

    const [[x1, y1], [x2, y2]] = line;
    for (let i = 0; i < edges.length; i++) {
      const edge: Line = edges[i];

      const [[x3, y3], [x4, y4]] = edge;
      const intersection = line_intersection(x1, y1, x2, y2, x3, y3, x4, y4);

      if (intersection) {
        this.target = {
          hit: [intersection.x, intersection.y],
          edge,
          index: i,
        };
        this.targetInfo = {
          edgeIndex: i,
          edge,
          ...intersection,
        };
        break;
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
    this.setAngle(getRandomFloatArbitrary(0, Math.PI * 2));
    // this.setAngle(Math.PI / 3);
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
      angle: this.angle,
    };
  }
}

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

  framePerSeconds = 30;
  timeElapsed = 0;
  interval: NodeJS.Timer;

  constructor(socket: Server, store: Store, lobby: Lobby) {
    this.lobby = lobby;
    this.socket = socket;
    this.store = store;
    // this.run();
    // this.socket.on('PaddleUpdate', this.updatePaddle);
    this.nPlayers = 12;
    this.generateMap(this.nPlayers);
  }

  addBall() {
    const ball = new Ball();
    ball.setAngle(getRandomFloatArbitrary(0, Math.PI * 2));
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
    this.interval = setInterval(() => this.tick(), 1000 / this.framePerSeconds);
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
        // If there is 2 players, bound on empty walls
        if (this.nPlayers == 2 && ball.target.index % 2) {
          const incidenceAngleDeg = angleToDegrees(ball.angle);
          const edge = this.map.edges[ball.target.index];
          const surfaceAngleDeg = lineAngle(edge); //paddle.angle;
          const newDegree = angleReflect(incidenceAngleDeg, surfaceAngleDeg);
          const newAngle = angleToRadians(newDegree);
          ball.setAngle(newAngle);
          ball.findTarget(this.map.edges);
        } else {
          const idx =
            this.nPlayers === 2 && ball.target.index === 2
              ? 1
              : ball.target.index;
          const paddle = this.paddles[idx];
          const boundSegment = paddle.line;
          const paddleTouchTheBall = (pointOnLine as any)(
            ball.target.hit,
            boundSegment,
            1,
          );
          if (paddleTouchTheBall) {
            const incidenceAngleDeg = angleToDegrees(ball.angle);
            const surfaceAngleDeg = paddle.angle; //paddle.angle;
            const newDegree = angleReflect(incidenceAngleDeg, surfaceAngleDeg);
            const newAngle = angleToRadians(newDegree);
            ball.speed *= 1.1;
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
    this.timeElapsed += 1 / this.framePerSeconds;
    // console.log(this.timeElapsed);
    if (this.timeElapsed > 5 * this.balls.length) this.addBall();
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
