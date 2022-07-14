/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   lobby.service.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/14 11:38:38 by adda-sil          #+#    #+#             */
/*   Updated: 2022/07/14 03:17:58 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Injectable, Inject, forwardRef, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import Game from 'src/game/game.class';
import Lobby, { ILobbyConfig, LobbyId } from 'src/game/lobby.class';
import Player from 'src/game/player.class';

import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import Store from 'redis-json';
import { User } from 'src/user';
import { SocketService } from 'src/socket';

@Injectable()
export class LobbyService {
  lobbies = new Map<LobbyId, Lobby>();
  store: Store<Lobby>;

  constructor(
    // @InjectRedis() private readonly redis: Redis,
    // @Inject(forwardRef(() => SocketService))
    private socketService: SocketService,
  ) {
    // this.store = new Store<Lobby>(redis, { prefix: 'game:' });
  }

  getLobbies(): Lobby[] {
    // const lobbies: any = (await this.store.get('game:*')) || [];
    const lobbies = this.lobbies.values();
    console.log('Lobbies', lobbies);
    return [...lobbies];
  }

  getLobby(id: LobbyId): Lobby {
    // return await this.store.get(`game:${id}`);
    const lobby = this.lobbies.get(id);
    return lobby;
  }

  clearLobbies() {
    // this.store.clearAll();
    this.lobbies.clear();
  }

  createLobby(host: User): Lobby {
    console.log('Host', host.id);
    // await this.store.set(`${hostId}`, new Lobby(hostId, new Player(hostId)));
    const player = new Player(host);
    this.lobbies.set(host.id, new Lobby(player));
    const lobby: Lobby = this.getLobby(host.id);
    return lobby;
  }
  // addLobby(client: Socket, lobbyConfig: ILobbyConfig) {
  // }

  // joinLobby(client: Socket, id: LobbyId) {

  // }
}
