/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   pong.service.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/13 02:58:11 by adda-sil          #+#    #+#             */
/*   Updated: 2022/06/13 02:58:12 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Injectable, Inject } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import Lobby, { ILobbyConfig, LobbyId } from 'src/game/lobby.class';
import Player from 'src/game/player.class';

import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';

@Injectable()
export class PongService {
  socketServer: Server = null;
  lobbies = new Map<number, Lobby>();
  connectedPlayer = new Map<string, Player>();
  id = 0;

  constructor(@InjectRedis() private readonly redis: Redis) {}

  generateId() {
    return ++this.id;
  }

  getLobbies(): Lobby[] {
    console.log("Getting lobbies")
    return [...this.lobbies.values()];
  }

  getLobby(id: number): Lobby {
    return this.lobbies.get(id);
  }

  clearLobbies() {
    this.lobbies = new Map<number, Lobby>();
    this.id = 0;
  }

  addConnectedPeople(player: Player) {
    if (this.connectedPlayer.has(player.socketId)) {
      console.log("Player is still connected");
      return;
    }
    this.connectedPlayer.set(player.socketId, player);
  }

  addLobby(client: Socket, lobbyConfig: ILobbyConfig) {
    // console.log("Adding lobby", socket, this.socketServer);
    const host = new Player(client.id);
    const lobby = new Lobby(this.generateId(), host);
    if (lobbyConfig) {
      console.log('Setting lobby config', lobbyConfig);
      lobby.configure(lobbyConfig);
    }
    client.join(`lobby-${lobby.id}`);
    this.socketServer.emit('refreshedLobbies');
  }

  joinLobby(client: Socket, id: LobbyId) {
    console.log('Pong service joining room', id);
    const lobby = this.lobbies.get(id);
    lobby.addPlayer(new Player(client.id));
    client.join(`lobby-${id}`);
    console.log('Joined', this.lobbies);
    this.socketServer.emit('refreshedLobbies');
  }
}
