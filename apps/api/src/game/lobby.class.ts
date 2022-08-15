/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   lobby.class.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/08/03 00:18:12 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/15 13:57:28 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import Game from './game.class';
import Player from './player.class';
import Spectator from './spectator.class';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { User } from 'src/user';
import { Bot } from './bot.class';
import { UnprocessableEntityException } from '@nestjs/common';
import { LobbyBot } from './lobbyBot.class';
import { SocketService } from 'src/socket';
import { Server } from 'socket.io';
import { LobbyService } from 'src/lobby';

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
  winner: Player | Bot;

  // @Exclude()
  // private readonly socketService: SocketService;
  // socket: BroadcastOperator<DefaultEventsMap, SocketData>;
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
    this.id = host.id;
    this.name = name;
    this.host = host;
    this.players = new Map<number, Player>();
    this.spectators = [];
    this.playersMax = 8;
    this.spectatorsMax = 10;
    this.bots = [];
    this.fillBots();
    console.log('Bots are', this.bots);
  }

  addPlayer(player: Player) {
    this.players.set(player.id, player);
    this.fillBots();
    this.sock.emit('lobby_change');
  }

  removePlayer(player: Player | User) {
    this.players.delete(player.id);
    this.fillBots();
    this.sock.emit('lobby_change');
  }

  start(): Game {
    // if (this.winner) return;
    if (this.game) {
      this.winner = null;
      this.game.stop();
      delete this.game;
    }
    this.game = new Game(this);
    this.sock.emit('start');
    return this.game;
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
    this.sock.emit('lobby_change', null);
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
