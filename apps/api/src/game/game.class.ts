/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   game.class.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/13 03:00:00 by adda-sil          #+#    #+#             */
/*   Updated: 2022/06/20 20:47:05 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import Lobby from './lobby.class';
import { Server, Socket } from 'socket.io';
import Redis from 'ioredis';
import RedisBridge from './redis.bridge';
import Store from 'redis-json';
import { lineInterpolate, polygonRegular, lineAngle, angleToDegrees, pointOnLine, Line, pointInPolygon, angleReflect, Point } from 'geometric';
import Polygon from 'polygon';
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
  velocity: {
    x: number;
    y: number;
  };
  constructor() {
    // console.log(this)
    this.pos = new Position(0, 0, 10, 10);
    this.velocity = { x: 1.5, y: 1 };
    // this.velocity.y = 0;
  }
  bounceTop() {
    this.velocity.y = -this.velocity.y
  };
  bounceSide() {
    this.velocity.x = -this.velocity.y
  }
}
class Paddle {
  pos: Position;
  line: Line;
  angle: number
  constructor(x = 0, y = 0, angle = 0, h = 5, w = 100) {
    this.pos = new Position(x, y, h, w);
    this.angle = angle;
    this.line = [[0, 0], [1, 0]];
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
    this.paddles = this.map.edges.map(([a, b], idx) => {
      console.log("Paddle", a, b);
      return new Paddle(a[0], b[0], this.map.angles[idx], 5, this.map.edgeWidth / 8);
    });
    this.socket.emit('mapChange', this.networkMap);
    this.socket.emit('gameUpdate', this.networkState);
  }

  run() {
    this.generateMap();
    this.socket.emit('mapChange', this.networkMap),
    this.interval = setInterval(async () => await this.tick(), 1000 / 60);
  }
  stop() {
    clearInterval(this.interval);
    this.interval = null;
  }


  updatePaddle(evt: string) {
    if (evt === 'ArrowUp' && this.paddles[0].pos.y > 0) {
      this.paddles[0].pos.y -= this.speed;
    } else if (evt === 'ArrowDown' && this.paddles[0].pos.y < 400) {
      this.paddles[0].pos.y += this.speed;
    }
  }

  updatePositionPaddles({ y }) {
    this.paddles[0].pos.y = y;
  }

  updatePaddlePercent(percent: number) {
    const playerIndex = 0;
    const paddle = this.paddles[playerIndex];
    const edge = this.map.edges[playerIndex];

    const newPos = lineInterpolate(edge)(percent);
    const newPosEnd = lineInterpolate(edge)(percent + .2);


    paddle.pos.x = newPos[0];
    paddle.pos.y = newPos[1];
    paddle.line = [newPos, newPosEnd];
    console.log(
      "Px: " + paddle.pos.x,
      "Py: " + paddle.pos.y,
      "lol", this.paddles[playerIndex].pos,
      // "Edge: ", edge,
      // "%: " + percent,
      // "New Pos", newPos
    );
  }


  async run_physics() {
    // console.log("ball is : ", this.ball)
    this.balls.forEach(ball => {
      const { x, y } = ball.pos;
      const point: Point = [x, y];
      const pip = pointInPolygon(point, this.map.verticles);

      if (!pip) {
        console.log("Ball not in polygon");
        // ball.velocity.x = -ball.velocity.x;
        // ball.velocity.y = -ball.velocity.y;

        for (let i = 0; i < this.paddles.length; i++) {
          // Not good to handle the hit point
          if (pointOnLine(point, this.paddles[i].line)) {
            console.log(`Paddle ${i} has been hitten`);
            // use it https://observablehq.com/@harrystevens/geometric-anglereflect to reflect the ball
            return ;
          }
        }

        ball.pos.x = 0;
        ball.pos.y = 0;
      }
      ball.pos.x += ball.velocity.x;
      ball.pos.y += ball.velocity.y;
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

  async tick() {
    // const game = await this.store.get(this.id);

    this.run_physics();
    // console.log(this.state);
    await Promise.all([
      // this.store.set(this.id, this.state),
      this.socket.emit('gameUpdate', this.networkState),
    ]);

  }
}

function getRandomArbitrary(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}
