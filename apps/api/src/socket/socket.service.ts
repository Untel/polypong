/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   socket.service.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/07/11 01:16:23 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/12 21:48:16 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { forwardRef, Inject, Injectable } from '@nestjs/common';
import Lobby from 'src/game/lobby.class';
import { SocketGateway } from './socket.gateway';
import { AuthSocket } from './ws-auth.middleware';

@Injectable()
export class SocketService {
  constructor(
    @Inject(forwardRef(() => SocketGateway))
    private readonly socketGateway: SocketGateway,
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

  public get connectedUsers() {
    const users = this.sockets.map((el) => el.data.user);
    return users;
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
    this.socketio.emit('refreshedLobbies', null);
  }
}
