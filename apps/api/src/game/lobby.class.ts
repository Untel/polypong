/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   lobby.class.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/08/03 00:18:12 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/27 00:45:27 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import Game from './game.class';
import Player from './player.class';
import Spectator from './spectator.class';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { User } from 'src/user';
import { Bot } from './bot.class';
import { Logger, UnprocessableEntityException } from '@nestjs/common';
import { LobbyBot } from './lobbyBot.class';
import { SocketService } from 'src/socket';
import { Server } from 'socket.io';
import { LobbyService } from 'src/lobby';
import { Match, UserMatch } from 'src/match-history';

export type LobbyId = number;

let nextid = 42000;

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
  logger = new Logger('Lobby');

  @Exclude()
  @Type(() => Match)
  match: Match;

  @Type(() => User)
  host: User;

  @Type(() => Player)
  @Transform(({ value }) => [...value.values()])
  players: Map<number, Player>;

  @Type(() => LobbyBot)
  bots: LobbyBot[];

  spectatorsMax: number;
  spectators: Spectator[];

  @Expose()
  public get isStarted() {
    return this.game && this.game.players.size;
  }

  @Exclude()
  game: Game | null;

  @Exclude()
  socketServer: Server;
  @Exclude()
  service: LobbyService;
  public get sock() {
    return this.socketServer.to(this.roomId);
  }

  constructor(service: LobbyService, host: User, name = 'Unamed lobby') {
    this.socketServer = service.socketService.socketio;
    this.service = service;
    this.id = nextid++;
    this.name = name;
    this.host = host;
    this.players = new Map<number, Player>();
    this.spectators = [];
    this.playersMax = 8;
    this.spectatorsMax = 10;
    this.bots = [];
    this.fillBots();
  }

  addPlayer(player: Player) {
    this.players.set(player.id, player);
    this.fillBots();
    this.sock.emit('lobby_change', this.id);
  }

  removePlayer(player: Player | User) {
    if (player) {
      if (this.players.has(player.id)) {
        this.players.delete(player.id);
      }
    }
    this.fillBots();
    this.sock.emit('lobby_change', this.id);
  }

  async start(): Promise<Game> {
    if (this.game) {
      this.game.stop();
      delete this.game;
    }
    this.game = new Game(this);
    await this.createMatchEntry();
    // eslint-disable-next-line prettier/prettier
    this.logger.log('ABOUT TO EMIT THE START EVENT TO LOBBY, this.id = ', this.id);
    this.sock.emit('start', this.id);
    this.logger.log(`Starting new game ${this.name}`);
    return this.game;
  }

  async createMatchEntry() {
    const match = new Match();
    match.totalPlayers = this.playersMax;
    match.botCount = this.bots.length;
    match.name = this.name;
    this.match = await match.save();
  }

  async createPlayerRank(player: Player, rank: number) {
    const um = new UserMatch();
    um.user = player.user;
    um.rank = rank + 1;
    um.match = this.match;
    const added = await um.save();
    console.log('Added rank', added, 'for', player.user.name);
  }

  configure(opts: Partial<Lobby>) {
    if (opts.name) this.name = opts.name;
    if (opts.spectatorsMax) this.spectatorsMax = opts.spectatorsMax;
    if (opts.bots)
      Object.keys(opts.bots).forEach((key) => {
        Object.assign(this.bots[key], opts.bots[key]);
      });
    if (opts.players)
      Object.keys(opts.players).forEach((key) => {
        const pl = this.players.get(+key);
        Object.assign(pl, opts.players[key]);
      });
    if (opts.playersMax) {
      this.playersMax = opts.playersMax;
      this.fillBots();
    }
    this.sock.emit('lobby_change', this.id);
  }

  fillBots() {
    const missingPlayers = this.playersMax - this.players.size;
    if (missingPlayers < 0) {
      throw new UnprocessableEntityException('You need to kick somone');
    }
    this.bots = this.bots.slice(0, missingPlayers);
    if (missingPlayers > 0) {
      while (this.bots.length < missingPlayers) {
        this.bots.push(new LobbyBot());
      }
    }
  }

  say(message) {
    this.sock.emit('message', message);
  }

  public get roomId() {
    return `lobby-${this.id}`;
  }
}
