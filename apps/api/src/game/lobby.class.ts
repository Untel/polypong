/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   lobby.class.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/08/03 00:18:12 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/04 08:28:48 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import Game from './game.class';
import Player from './player.class';
import Spectator from './spectator.class';
import { Exclude, Transform, Type } from 'class-transformer';
import { BroadcastOperator } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { SocketData } from 'src/socket';

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

  @Exclude()
  game: Game | null;

  @Exclude()
  sock = null;
  // socket: BroadcastOperator<DefaultEventsMap, SocketData>;

  constructor(socket, host: Player, name = 'Unamed lobby') {
    this.id = host.id;
    this.name = name;
    this.host = host;
    console.log('Socket instance', socket);
    this.sock = socket;
    this.players = new Map<number, Player>();
    // No need to add the host as player because he will automatically join it
    // this.addPlayer(host);
    this.spectators = [];
    this.playersMax = 8;
    this.spectatorsMax = 10;
  }

  addPlayer(player: Player) {
    this.players.set(player.id, player);
    player.inLobby = this.id;
    this.sock.emit('room_connect', [...this.players.values()]);
  }

  removePlayer(player: Player) {
    this.players.delete(player.id);
    player.inLobby = null;
    this.sock.emit('room_connect', [...this.players.values()]);
  }

  start(): Game {
    this.game = new Game(this);
    this.sock.emit('start');
    return this.game;
  }

  configure(opts: ILobbyConfig) {
    if (opts.name) this.name = opts.name;
    if (opts.playersMax) this.playersMax = opts.playersMax;
    if (opts.spectatorsMax) this.spectatorsMax = opts.spectatorsMax;
  }

  public get roomId() {
    return `lobby-${this.id}`;
  }
}
