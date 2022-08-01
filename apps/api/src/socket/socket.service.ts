/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   socket.service.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/07/11 01:16:23 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/01 19:38:26 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Injectable } from '@nestjs/common';
import Lobby from 'src/game/lobby.class';
import { SocketGateway } from './socket.gateway';
import { AuthSocket } from './ws-auth.middleware';

@Injectable()
export class SocketService {
  constructor(private readonly socketGateway: SocketGateway) {
    setInterval(() => {
      console.log(
        'Connected users',
        this.connectedUsers.map((u) => u.id),
        [...this.socketio.sockets.sockets.values()].length,
      );
    }, 1000);
  }

  public get socketio() {
    return this.socketGateway.server;
  }

  public get sockets() {
    return [...this.socketio.sockets.sockets.values()];
  }

  public get connectedUsers() {
    const users = this.sockets.map((el: AuthSocket) => el.user);
    return users;
  }

  getUserSocket(userID) {
    return this.sockets.find((el: AuthSocket) => el.user.id === userID);
  }

  sendNewLobby(lobby: Lobby) {
    this.socketio.emit('refreshedLobbies', lobby);
  }
}
