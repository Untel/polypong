import Game from "./game.class";
import Player from "./player.class";
import Spectator from "./spectator.class";

type LobbyId = number;

export interface ILobby {
  lobbyId: LobbyId;
  playerCount: number;
  players: Player[];
  spectators: Spectator[];
}

export default class Lobby implements ILobby {
  lobbyId: LobbyId;
  playerCount: number;
  players: Player[];
  spectators: Spectator[];
  constructor(host: Player) {
    this.players = [host];
    this.spectators = [];
    this.playerCount = 2;
  }

  start() : Game {
    return new Game(this);
  }
}
