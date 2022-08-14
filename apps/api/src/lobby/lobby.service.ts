/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   lobby.service.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/14 11:38:38 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/14 02:48:54 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Injectable, Inject, forwardRef, Logger } from '@nestjs/common';
import Lobby, { LobbyId } from 'src/game/lobby.class';
import Player from 'src/game/player.class';

// import Store from 'redis-json';
import { User, UserService } from 'src/user';
import { SocketService } from 'src/socket';
@Injectable()
export class LobbyService {
  lobbies = new Map<LobbyId, Lobby>();
  // store: Store<Lobby>;
  logger = new Logger('LobbyService');
  constructor(
    // @InjectRedis() private readonly redis: Redis,
    @Inject(forwardRef(() => SocketService))
    private socketService: SocketService,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
  ) {
    // this.store = new Store<Lobby>(redis, { prefix: 'game:' });
    // this.mock();
  }

  async mock() {
    const players = await Promise.all([
      this.userService.findById(1),
      this.userService.findById(2),
      this.userService.findById(3),
      this.userService.findById(6),
    ]);
    const lobby = this.createLobby(players[0], 'Autogenerated game');
    for (let i = 0; i < 4; i++) lobby.addPlayer(new Player(players[i]));
    lobby.configure({ playersMax: 5 });
    lobby.start();
  }

  getLobbies(): Lobby[] {
    const lobbies = this.lobbies.values();
    return [...lobbies];
  }

  getLobby(id: LobbyId): Lobby {
    const lobby = this.lobbies.get(id);
    return lobby;
  }

  userIsInLobby(userId: number) {
    const lobbyPresent = this.getLobbies().find((l: Lobby) =>
      [...l.players.values()].find((p: Player) => p.user.id === userId),
    );
    return lobbyPresent;
  }

  userJoinLobby(lobby: Lobby, user: User) {
    const socketOfJoiner = this.socketService.getUserSocket(user.id);
    if (lobby.players.has(user.id)) {
      socketOfJoiner.join(lobby.roomId);
      this.logger.warn(
        `User ${user.id} already is in this lobby ${lobby.roomId}, rejoining the socket`,
      );
      return;
    }

    const stillInLobby = this.userIsInLobby(user.id);
    if (stillInLobby) {
      this.logger.warn(
        `User ${user.id} already is in this lobby ${lobby.roomId}, leaving the socket and the lobby`,
      );
      stillInLobby.removePlayer(user);
      socketOfJoiner.leave(stillInLobby.roomId);
    }

    lobby.addPlayer(new Player(user));
    socketOfJoiner.join(lobby.roomId);
    socketOfJoiner.data.lobby = lobby;
    socketOfJoiner.send(`Welcome in lobby ${lobby.name}, ${user.name}`);
    this.socketService.socketio
      .to(lobby.roomId)
      .except(socketOfJoiner.id)
      .emit('lobby_change');
    this.socketService.socketio.emit('online', { type: 'join' });
    this.logger.log(`User ${user.id} joined lobby ${lobby.roomId}`);
  }

  clearLobbies() {
    this.lobbies.clear();
  }

  createLobby(host: User, name: string): Lobby {
    const lobby = new Lobby(this.socketService.socketio, host, name);
    this.lobbies.set(host.id, lobby);
    this.socketService.sendNewLobby(lobby);
    return lobby;
  }
}
