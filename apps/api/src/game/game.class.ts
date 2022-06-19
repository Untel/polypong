/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   game.class.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/13 03:00:00 by adda-sil          #+#    #+#             */
/*   Updated: 2022/06/19 19:26:06 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import Lobby from './lobby.class';
import { Server, Socket } from 'socket.io';
import Redis from 'ioredis';
import RedisBridge from './redis.bridge';
import Store from 'redis-json';
import { polygonRegular } from 'geometric';
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
  constructor() {
    this.pos = new Position(0, 0, 5, 100);
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

    const nPlayers = 3//lobby.players.size;
    const nEdges = nPlayers > 2 && nPlayers || 4;


    console.log('Edges', this.edges);
    this.edges = new Polygon(polygonRegular(nEdges, 2000, [50, 50]))
    console.log('poly', this.edges);
    // console.log('poly 2', this.edges.offset(1));
    this.edges = new MyPolygon(3).verticles;
    this.map = new MyPolygon(3);
    console.log("Edges", this.map);
    this.socket.emit('mapChange', { edges: this.map.verticles } ),
    this.balls[0] = new Ball();
    this.paddles[0] = new Paddle();
    this.paddles[1] = new Paddle();

    // this.run();
    // this.socket.on('PaddleUpdate', this.updatePaddle);
  }

  run() {
    this.map = new MyPolygon(getRandomArbitrary(3, 9));
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

  async run_physics() {
    // console.log("ball is : ", this.ball)
    this.balls.forEach(ball => {
      ball.pos.x += ball.velocity.x;
      ball.pos.y += ball.velocity.y;
      if (ball.pos.x >= 500 - 20 || ball.pos.x <= 0)
        ball.bounceSide();
      else if (ball.pos.y >= 500 - 20 || ball.pos.y <= 0)
        ball.bounceTop();
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
