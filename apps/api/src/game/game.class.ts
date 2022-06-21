/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   game.class.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/13 03:00:00 by adda-sil          #+#    #+#             */
/*   Updated: 2022/06/21 12:21:05 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import Lobby from './lobby.class';
import { Server, Socket } from 'socket.io';
import Redis from 'ioredis';
import RedisBridge from './redis.bridge';
import Store from 'redis-json';
import { lineInterpolate, polygonRegular, lineAngle, angleToDegrees, pointOnLine, Line, pointInPolygon, angleReflect, Point } from 'geometric';
import { polygonOffset } from 'polygon';
import MyPolygon from './polygon.class';

class Position {
  x: number;
  y: number;
  w: number;
  h: number;

  constructor(x: number, y: number, w: number, h: number) {
    this.x = x;
    this.y = y;
    this.h = h;
    this.w = w;
  }
}

class Ball {
  pos: Position;
  speed: number;
  angle: number;
  direction: any;
  lastHitten: any;

  constructor() {
    // console.log(this)
    this.pos = new Position(0, 0, 10, 10);
    this.angle = 0;
    this.speed = 1;
    // this.velocity.y = 0;
  }

  move() {
    this.pos.x += Math.sin(this.angle) * this.speed;
    this.pos.y += Math.cos(this.angle) * this.speed;
  }

  reset() {
    this.pos.x = 0;
    this.pos.y = 0;
    this.angle = getRandomFloatArbitrary(0, Math.PI * 2);
  }
}
class Paddle {
  line: Line;
  interpolate: Function;

  constructor(axis: Line) {
    this.interpolate = lineInterpolate(axis)
    this.updatePercentOnAxis(.5);
  }

  updatePercentOnAxis(ratio: number) {
    const newPos = this.interpolate(ratio);
    const newPosEnd = this.interpolate(ratio + .2);
    this.line = [
      newPos,
      newPosEnd,
    ];
  }
}

export default class Game {
  lobby: Lobby;
  socket: Server;
  store: Store;

  balls: Ball[] = [];
  paddles: Paddle[] = [];
  speed: number = 10;
  edges: any;
  map: Polygon;

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
    const nPlayers = getRandomArbitrary(3, 9)//lobby.players.size;
    const nEdges = nPlayers > 2 && nPlayers || 4;

    console.log('Edges', this.edges);
    // this.edges = new Polygon(polygonRegular(nEdges, 2000, [50, 50]))
    this.map = new MyPolygon(nPlayers);
    this.balls[0] = new Ball();
    this.paddles = this.map.edges.map((line, idx) => {
      console.log("Paddle", line);
      return new Paddle(line);
    });
    this.socket.emit('mapChange', this.networkMap);
    this.socket.emit('gameUpdate', this.networkState);
  }

  run() {
    this.generateMap();
    this.socket.emit('mapChange', this.networkMap),
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
    this.paddles.forEach(paddle => {
      paddle.updatePercentOnAxis(percent);
    });
  }


  run_physics() {
    // console.log("ball is : ", this.ball)
    this.balls.forEach(ball => {
      const { x, y } = ball.pos;
      const point: Point = [x, y];

      for (let i = 0; i < this.paddles.length; i++) {
        // Not good to handle the hit point
        if (pointOnLine(point, this.paddles[i].line)) {
          console.log(`Paddle ${i} has been hitten`);
          // use it https://observablehq.com/@harrystevens/geometric-anglereflect to reflect the ball
          return ;
        }
      }

      const pip = pointInPolygon(point, this.map.verticles);

      if (!pip) {
        // console.log("Ball not in polygon");
        // ball.velocity.x = -ball.velocity.x;
        // ball.velocity.y = -ball.velocity.y;


        ball.reset();
      }
      ball.move();
    })
  }

  // Getters
  public get isPaused() {
    return !this.interval;
  }
  public get networkState() {
    return {
      balls: this.balls,
      paddles: this.paddles,
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
    this.run_physics();
    this.socket.emit('gameUpdate', this.networkState);
  }
}

function getRandomArbitrary(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}
function getRandomFloatArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}
