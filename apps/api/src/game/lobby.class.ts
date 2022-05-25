import Game from "./game.class";
import Player from "./player.class";
import Spectator from "./spectator.class";

export type LobbyId = number;

export interface ILobby {
  id: LobbyId;
  players: Map<string, Player>;
  spectators: Spectator[];
}

export interface ILobbyConfig {
  name: string;
  playerMax: number;
  spectatorsMax: number;
}

export default class Lobby implements ILobby, ILobbyConfig {
  id: LobbyId;
  name: string;
  playerMax: number;
  host: Player;
  players: Map<string, Player>;
  spectatorsMax: number;
  spectators: Spectator[];

  constructor(id: LobbyId, host: Player) {
    this.id = id;
    this.name = 'Unamed lobby';
    this.host = host;
    this.players = new Map<string, Player>();
    this.addPlayer(host);
    this.spectators = [];
    this.playerMax = 8;
    this.spectatorsMax = 10;
  }

  addPlayer(player: Player) {
    this.players.set(player.socketId, player);
    player.inLobby = this.id;
  }

  start(): Game {
    return new Game(this);
  }

  configure(opts: ILobbyConfig) {
    if (opts.name)
      this.name = opts.name;
    if (opts.playerMax)
      this.playerMax = opts.playerMax;
    if (opts.spectatorsMax)
      this.spectatorsMax = opts.spectatorsMax;
  }
}
