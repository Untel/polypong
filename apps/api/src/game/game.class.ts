import Lobby from "./lobby.class";
import { Server, Socket } from 'socket.io';

export default class Game {
  lobby: Lobby;
  socket: Server;
  ball: {
    x: number,
    y: number
  };
  paddle1: {
    x: number,
    y: number
  };
  paddle2: {
    x: number,
    y: number
  };
  speed: number = 10;
  constructor(socket: Server, lobby: Lobby) {

    this.lobby = lobby;
    this.socket = socket;

    this.ball = { x: 0, y: 0 };
    // this.ball.y = 0;
    this.paddle1 = { x: 0, y: 0 };
    this.paddle2 = { x: 0, y: 0 };

    // this.socket.on('PaddleUpdate', this.updatePaddle);

    setInterval(() => this.tick(), 1000 / 60);
  }

  updatePaddle(evt: string) {
    if (evt === 'ArrowUp' && this.paddle1.y > 0) {
      this.paddle1.y -= this.speed;
    }
    else if (evt === 'ArrowDown' && this.paddle1.y < 400) {
      this.paddle1.y += this.speed;
    }
  }


  tick() {
    this.socket.emit('gameUpdate', { ball: this.ball, paddle1: this.paddle1, paddle2: this.paddle2 });
  }
}