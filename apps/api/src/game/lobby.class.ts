import Game from "./game.class";
import Player from "./player.class";
import Spectator from "./spectator.class";

export default class Lobby {
  playerCount: number;
  players: Player[];
  spectators: Spectator[];

  constructor() {}

  start() : Game {
    return new Game(this);
  }
}
