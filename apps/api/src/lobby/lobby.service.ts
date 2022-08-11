/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   lobby.service.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/14 11:38:38 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/11 05:51:47 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import {
  Injectable,
  Inject,
  forwardRef,
  UseInterceptors,
  ClassSerializerInterceptor,
  UnprocessableEntityException,
  Logger,
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
  logger = new Logger('LobbyService');
  constructor(
    // @InjectRedis() private readonly redis: Redis,
    @Inject(forwardRef(() => SocketService))
    private socketService: SocketService,
  ) {
    // this.store = new Store<Lobby>(redis, { prefix: 'game:' });
  }

  getLobbies(): Lobby[] {
    const lobbies = this.lobbies.values();
    return [...lobbies];
  }

  getLobby(id: LobbyId): Lobby {
    // return await this.store.get(`game:${id}`);
    const lobby = this.lobbies.get(id);
    return lobby;
  }

  userIsInLobby(user: User) {
    const lobbyPresent = this.getLobbies().find((l: Lobby) =>
      [...l.players.values()].find((p: Player) => p.user.id === user.id),
    );
    console.log('After reconnect, user found in lobby', lobbyPresent && lobbyPresent.id);
    return lobbyPresent;
  }

  userJoinLobby(lobby: Lobby, user: User) {
    const stillInLobby = this.userIsInLobby(user);
    const socketOfJoiner = this.socketService.getUserSocket(user.id);

    if (stillInLobby) {
      socketOfJoiner.leave(stillInLobby.roomId);
      stillInLobby.removePlayer(user);
    }
    lobby.addPlayer(new Player(user));
    socketOfJoiner.join(lobby.roomId);
    socketOfJoiner.send(`Welcome in lobby ${lobby.name}`);
    this.socketService.socketio.to(lobby.roomId).emit('lobby_change');
  }

  getAndJoinLobby(id: LobbyId, user: User): Lobby {
    // return await this.store.get(`game:${id}`);
    const lobby = this.lobbies.get(id);
    if (!lobby) return null;
    return lobby;
  }

  clearLobbies() {
    this.lobbies.clear();
  }

  createLobby(host: User, name: string): Lobby {
    console.log('Host', host.id);
    // await this.store.set(`${hostId}`, new Lobby(hostId, new Player(hostId)));
    const channel = this.socketService.getRoom(`lobby-${host.id}`);
    const lobby = new Lobby(channel, host, name);
    this.lobbies.set(host.id, lobby);
    this.socketService.sendNewLobby(lobby);
    return lobby;
  }

  updateLobby(lobby: Lobby, datas: Partial<Lobby>): Lobby {
    console.log('WHERE I COME FROM');
    return;
    lobby.configure(datas);
    this.socketService.socketio.to(lobby.roomId).emit('lobby_change');
    return lobby;
  }
}
