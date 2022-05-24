import Lobby from "./lobby.class";

export default class Game {
  lobby: Lobby;
  constructor(lobby: Lobby) {
    this.lobby = lobby;
  }

  tick() {
    // there is game logic
  }
}