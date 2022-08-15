/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   socket.service.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/07/11 01:16:23 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/15 00:19:18 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import { LobbyService, User, UserService, UserWithLobby } from 'src';
import Lobby from 'src/game/lobby.class';
import { SocketGateway } from './socket.gateway';

@Injectable()
export class SocketService {
  constructor(
    @Inject(forwardRef(() => SocketGateway))
    private readonly socketGateway: SocketGateway,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => LobbyService))
    private readonly lobbyService: LobbyService,
  ) {
    setInterval(async () => {
      console.log(
        'Connected users',
        (await this.connectedUsers()).map((u) => u.id),
        [...this.socketio.sockets.sockets.values()].length,
      );
    }, 5000);
  }

  public get socketio() {
    return this.socketGateway.server;
  }

  public get sockets() {
    return [...this.socketio.sockets.sockets.values()];
  }

  public async connectedUsers() {
    const usersIds = this.sockets
      .map((el) => el.data.user?.id)
      .filter((el) => el)
      .map((el) => +el);
    const users = await this.userService.findMany(usersIds);
    const usersWithLobbies = users.map((u) => {
      const lobby = this.lobbyService.userIsInLobby(u.id);
      const statued: UserWithLobby = Object.assign(u, {
        inLobby: !!lobby,
        inGame: !!lobby?.game,
      });
      return statued;
    });
    return usersWithLobbies;
  }

  serializeEmit<T>(event: string, generic: T, to = null) {
    const serialized = instanceToPlain<T>(generic);
    this.socketio.emit(event, serialized);
  }

  async getUsersInRoom(room: string) {
    const sockets = await this.socketio.in(room).fetchSockets();
    const userIds = sockets.map((s) => s.data.user.id);
    return this.userService.findMany(userIds);
  }

  getUserSocket(userID) {
    return this.sockets.find((el) => el.data.user.id === userID);
  }
}
