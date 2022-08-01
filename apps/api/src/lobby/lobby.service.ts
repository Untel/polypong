/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   lobby.service.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/14 11:38:38 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/01 17:50:38 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import {
  Injectable,
  Inject,
  forwardRef,
  UseInterceptors,
  ClassSerializerInterceptor,
  UnprocessableEntityException,
} from '@nestjs/common';
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

  getAndJoinLobby(id: LobbyId, user: User): Lobby {
    // return await this.store.get(`game:${id}`);
    const lobby = this.lobbies.get(id);
    console.log('Searching lobby', lobby, this.lobbies);
    if (!lobby) return null;
    const socketOfJoiner = this.socketService.getUserSocket(user.id);
    if (!socketOfJoiner) {
      console.log('This should never happen if socket is connected');
    }
    socketOfJoiner.join(`lobby-${lobby.id}`);
    console.log('User ', user.id, 'joined the lobby', lobby.id);
    return lobby;
  }

  clearLobbies() {
    // this.store.clearAll();
    this.lobbies.clear();
  }

  createLobby(host: User, name: string): Lobby {
    console.log('Host', host.id);
    // await this.store.set(`${hostId}`, new Lobby(hostId, new Player(hostId)));
    const player = new Player(host);
    this.lobbies.set(host.id, new Lobby(player, name));
    const lobby: Lobby = this.getLobby(host.id);
    this.socketService.sendNewLobby(lobby);
    return lobby;
  }

  updateLobby(id: LobbyId, lobby: Lobby): Lobby {
    console.log('Updating value', lobby);
    const old = this.lobbies.get(id);
    if (!old) {
      throw new UnprocessableEntityException('Unfoundable lobby');
    }
    Object.assign(old, lobby);
    const updatedLobby = this.lobbies.get(id);
    this.socketService.sendNewLobby(updatedLobby);
    return updatedLobby;
  }
  // addLobby(client: Socket, lobbyConfig: ILobbyConfig) {
  // }

  // joinLobby(client: Socket, id: LobbyId) {

  // }
}
