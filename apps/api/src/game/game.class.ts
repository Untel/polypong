import Lobby from "./lobby.class";

export default class Game {
  lobby: Lobby;
  loopId: NodeJS.Timeout;
  constructor(lobby: Lobby) {
    this.lobby = lobby;

    this.loopId = setTimeout(() => this.tick(), 10)
  }

  destroyed() {
    clearTimeout(this.loopId);
  }

  tick() {

    // there is game logic
  }
}