import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import Game from 'src/game/game.class';
import Lobby, { ILobbyConfig, LobbyId, } from 'src/game/lobby.class';
import Player from 'src/game/player.class';

@Injectable()
export class PongService {
  socketServer: Server = null;
  lobbies = new Map<number, Lobby>();
  connectedPlayer = new Map<string, Player>();
  id = 0;
  tmpGame = null

  constructor() {
    setTimeout(() => {
      console.log('In constrcutor service', this.socketServer);
      this.tmpGame = new Game(this.socketServer, new Lobby(0, new Player(0)));
    }, 3000);
  }

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

  addConnectedPeople(player: Player) {
    if (this.connectedPlayer.has(player.socketId)) {
      console.log("Player is still connected");
      return;
    }
    this.connectedPlayer.set(player.socketId, player);
  }

  addLobby(client: Socket, lobbyConfig: ILobbyConfig) {
    // console.log("Adding lobby", socket, this.socketServer);
    const host = new Player(client.id);
    const lobby = new Lobby(this.generateId(), host);
    if (lobbyConfig) {
      console.log('Setting lobby config', lobbyConfig);
      lobby.configure(lobbyConfig);
    }
    this.lobbies.set(lobby.id, lobby);
    client.join(`lobby-${lobby.id}`);
    this.socketServer.emit('refreshedLobbies');
  }

  joinLobby(client: Socket, id: LobbyId) {
    console.log('Pong service joining room', id);
    const lobby = this.lobbies.get(id);
    lobby.addPlayer(new Player(client.id));
    client.join(`lobby-${id}`);
    console.log('Joined', this.lobbies);
    this.socketServer.emit('refreshedLobbies');
  }
}
