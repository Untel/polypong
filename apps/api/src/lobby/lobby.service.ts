/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   lobby.service.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/14 11:38:38 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/02 22:00:47 by adda-sil         ###   ########.fr       */
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
import { pick } from 'lodash';
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
    if (!lobby) return null;
    const socketOfJoiner = this.socketService.getUserSocket(user.id);
    if (!socketOfJoiner) {
      console.log('This should never happen if socket is connected');
    }
    lobby.addPlayer(new Player(user));
    socketOfJoiner.data.lobby = lobby;
    socketOfJoiner.join(lobby.roomId);
    console.log('Lobby change', lobby.roomId);
    this.socketService.socketio.to(lobby.roomId).emit('lobby_change');

    // lobby.users = this.socketService.getUsersInRoom(`lobby-${lobby.id}`);
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
    const channel = this.socketService.getRoom(`lobby-${host.id}`);
    const lobby = new Lobby(channel, player, name);
    this.lobbies.set(host.id, lobby);
    this.socketService.sendNewLobby(lobby);
    return lobby;
  }

  updateLobby(id: LobbyId, datas: Lobby): Lobby {
    // console.log('Updating value', lobby);
    const lobby = this.lobbies.get(id);
    if (!lobby) {
      throw new UnprocessableEntityException('Unfoundable lobby');
    }

    Object.assign(lobby, pick(datas, ['name', 'playersMax', 'spectatorsMax']));
    const updatedLobby = this.lobbies.get(id);
    this.socketService.socketio.to(lobby.roomId).emit('lobby_change');
    return updatedLobby;
  }
  // addLobby(client: Socket, lobbyConfig: ILobbyConfig) {
  // }

  // joinLobby(client: Socket, id: LobbyId) {

  // }
}
