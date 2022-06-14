/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   game.class.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/13 03:00:00 by adda-sil          #+#    #+#             */
/*   Updated: 2022/06/14 11:13:46 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import Lobby from './lobby.class';
import { Server, Socket } from 'socket.io';


class Ball {
  x: number;
  y: number;
  velocity: {
    x: number;
    y: number;
  };
  constructor() {
    this.x = 0;
    this.y = 0;
    // console.log(this)
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
  x: number;
  y: number;
  width: number;
  height: number;
}
export default class Game {
  lobby: Lobby;
  socket: Server;

  ball: Ball;
  paddle1: Paddle;
  paddle2: Paddle;
  speed: number = 10;
  constructor(socket: Server, lobby: Lobby) {

    this.lobby = lobby;
    this.socket = socket;

    this.ball = new Ball();
    //   x: 0, y: 0, velocity: { x: 1, y: 1 }
    // }
    // this.ball.y = 0;
    this.paddle1 = new Paddle();
    this.paddle2 = new Paddle();

    // this.socket.on('PaddleUpdate', this.updatePaddle);

    setInterval(() => this.tick(), 1000 / 60);
  }

  updatePaddle(evt: string) {
    if (evt === 'ArrowUp' && this.paddle1.y > 0) {
      this.paddle1.y -= this.speed;
    } else if (evt === 'ArrowDown' && this.paddle1.y < 400) {
      this.paddle1.y += this.speed;
    }
  }

  updatePositionPaddles({ y }) {
    this.paddle1.y = y;
  }
  run_physics() {
    // console.log("ball is : ", this.ball)
    this.ball.x += this.ball.velocity.x;
    this.ball.y += this.ball.velocity.y;
    if (this.ball.x >= 500 - 20 || this.ball.x <= 0)
      this.ball.bounceSide();
    if (this.ball.y >= 500 - 20 || this.ball.y <= 0)
      this.ball.bounceTop();
  }
  tick() {
    this.run_physics();
    this.socket.emit('gameUpdate', { ball: { x: this.ball.x, y: this.ball.y }, paddle1: this.paddle1, paddle2: this.paddle2 });
  }
}
