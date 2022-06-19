/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   game.class.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/13 03:00:00 by adda-sil          #+#    #+#             */
/*   Updated: 2022/06/19 02:14:54 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import Lobby from './lobby.class';
import { Server, Socket } from 'socket.io';
import Redis from 'ioredis';
import RedisBridge from './redis.bridge';
import Store from 'redis-json';

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

  interval: NodeJS.Timer;

  constructor(socket: Server, store: Store, lobby: Lobby) {

    this.lobby = lobby;
    this.socket = socket;
    this.store = store;

    this.balls[0] = new Ball();
    this.paddles[0] = new Paddle();
    this.paddles[1] = new Paddle();

    // this.run();
    // this.socket.on('PaddleUpdate', this.updatePaddle);
  }

  run() {
    this.interval = setInterval(async () => await this.tick(), 1000 / 60);
  }
  stop() {
    clearInterval(this.interval);
    this.interval = null;
  }
  public get isPaused() {
    return !this.interval;
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

  public get state() {
    return {
      balls: this.balls,
      paddles: this.paddles,
      isPaused: this.isPaused
    };
  }

  public get id() {
    return `${this.lobby.id}`;
  }

  async tick() {
    // const game = await this.store.get(this.id);

    this.run_physics();
    console.log(this.state);
    await Promise.all([
      // this.store.set(this.id, this.state),
      this.socket.emit('gameUpdate', this.state),
    ]);

  }
}
