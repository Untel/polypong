import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import Lobby from 'src/game/lobby.class';
import Player from 'src/game/player.class';

@Injectable()
export class PongService {
  socketServer: Server = null;
  lobbies = new Map<number, Lobby>();
  id = 0;

  constructor() {}

  generateId() {
    return ++this.id;
  }

  getLobbies(): Lobby[] {
    console.log("Getting lobbies");
    return [...this.lobbies.values()];
  }

  clearLobbies() {
    this.lobbies = new Map<number, Lobby>();
    this.id = 0;
  }

  addLobby(socket: Socket) {
    console.log("Adding lobby", this.id);
    const lobby = new Lobby(new Player());
    this.lobbies.set(this.generateId(), lobby);
    this.socketServer.emit('refreshedLobbies');
  }
}
