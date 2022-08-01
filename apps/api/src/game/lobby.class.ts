import Game from './game.class';
import Player from './player.class';
import Spectator from './spectator.class';
import { Transform, Type } from 'class-transformer';

export type LobbyId = number;

export interface ILobby {
  id: LobbyId;
  players: Map<number, Player>;
  spectators: Spectator[];
}

export interface ILobbyConfig {
  name: string;
  playersMax: number;
  spectatorsMax: number;
}

export default class Lobby implements ILobby, ILobbyConfig {

  id: LobbyId;
  name: string;
  playersMax: number;

  @Type(() => Player)
  host: Player;

  @Type(() => Player)
  @Transform(({ value }) => [...value.values()], { toPlainOnly: true })
  players: Map<number, Player>;

  spectatorsMax: number;
  spectators: Spectator[];
  game: Game | null;

  constructor(host: Player, name: string = 'Unamed lobby') {
    this.id = host.id;
    this.name = name;
    this.host = host;
    this.players = new Map<number, Player>();
    this.addPlayer(host);
    this.spectators = [];
    this.playersMax = 8;
    this.spectatorsMax = 10;
  }

  addPlayer(player: Player) {
    this.players.set(player.id, player);
    player.inLobby = this.id;
  }

  start(): Game {
    // this.game = new Game(this);
    return this.game;
  }

  configure(opts: ILobbyConfig) {
    if (opts.name) this.name = opts.name;
    if (opts.playersMax) this.playersMax = opts.playersMax;
    if (opts.spectatorsMax) this.spectatorsMax = opts.spectatorsMax;
  }
}
