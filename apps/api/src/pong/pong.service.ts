import { Injectable } from '@nestjs/common';
import Lobby from 'src/game/lobby.class';

@Injectable()
export class PongService {
  lobbies: Map<string, Lobby>;

  constructor() {}

  getLobbies(): Lobby[] {
    return [...this.lobbies.values()];
  }

  addLobby() {
    this.lobbies.set('abc', new Lobby());
  }
}
