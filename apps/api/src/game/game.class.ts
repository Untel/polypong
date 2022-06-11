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

  constructor(socket: Server, lobby: Lobby) {

    this.lobby = lobby;
    this.socket = socket;
    // console.log(' Game constr', this.socket);

    // console.log("gamelogic");
    // this.tick();

    this.ball = { x: 0, y: 0 };
    // this.ball.y = 0;
    this.paddle1 = { x: 0, y: 0 };
    this.paddle2 = { x: 0, y: 0 };

    // this.paddle1.x = 0;
    // this.paddle1.y = 0;

    // this.paddle2.x = 0;
    // this.paddle2.y = 0;
    // this.socket.on('PaddleUpdate', this.updatePaddle);

    setInterval(() => this.tick(), 1000 / 60);
  }

  updatePaddle(evt) {
    console.log(evt);
  }

  tick() {
    // console.log('TIck', this.socket);
    // there is game logic
    // console.log("update")
    this.socket.emit('gameUpdate', { ball: this.ball, paddle1: this.paddle1, paddle2: this.paddle2 });
  }
}