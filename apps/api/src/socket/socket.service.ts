/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   socket.service.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/07/11 01:16:23 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/14 02:29:03 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { LobbyService, UserService } from 'src';
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
    // setInterval(() => {
    //   console.log(
    //     'Connected users',
    //     this.connectedUsers.map((u) => u.id),
    //     [...this.socketio.sockets.sockets.values()].length,
    //   );
    // }, 5000);
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
      const lobby = this.lobbyService.userIsInLobby(u);
      return { ...u, inLobby: !!lobby?.id, inGame: !!lobby?.game };
    });
    return usersWithLobbies;
  }

  getRoom(room: string) {
    return this.socketio.in(room);
  }

  async getUsersInRoom(room: string) {
    const sockets = await this.socketio.in(room).fetchSockets();
    const usrs = sockets.map((s) => s.data.user);
    return usrs;
  }

  getUserSocket(userID) {
    return this.sockets.find((el) => el.data.user.id === userID);
  }

  sendNewLobby(lobby: Lobby) {
    // const serialized = instanceToPlain(lobby);
    this.socketio.emit('refreshedLobbies', null);
  }
}
