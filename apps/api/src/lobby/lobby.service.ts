/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   lobby.service.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/14 11:38:38 by adda-sil          #+#    #+#             */
/*   Updated: 2022/07/14 01:53:33 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Injectable, Inject } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import Game from 'src/game/game.class';
import Lobby, { ILobbyConfig, LobbyId } from 'src/game/lobby.class';
import Player from 'src/game/player.class';

import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import Store from 'redis-json';

@Injectable()
export class LobbyService {
  lobbies = new Map<LobbyId, Lobby>();
  store: Store<Lobby>;

  constructor(@InjectRedis() private readonly redis: Redis) {
    this.store = new Store<Lobby>(redis, { prefix: 'game:' });
  }

  async getLobbies(): Promise<Lobby[]> {
    const lobbies: any = (await this.store.get('game:*')) || [];
    console.log('Lobbies', lobbies);
    return [...lobbies];
  }

  async getLobby(id: LobbyId): Promise<Lobby> {
    return await this.store.get(`game:${id}`);
  }

  clearLobbies() {
    this.store.clearAll();
  }

  async createLobby(hostId: LobbyId) {
    console.log('Host id', hostId);
    await this.store.set(`${hostId}`, new Lobby(hostId, new Player(hostId)));
    return this.getLobby(hostId);
  }
  // addLobby(client: Socket, lobbyConfig: ILobbyConfig) {
  // }

  // joinLobby(client: Socket, id: LobbyId) {

  // }
}
