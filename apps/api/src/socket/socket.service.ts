/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   socket.service.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/07/11 01:16:23 by adda-sil          #+#    #+#             */
/*   Updated: 2022/07/11 02:00:07 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Injectable } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { AuthSocket } from './ws-auth.middleware';

@Injectable()
export class SocketService {
  constructor(private readonly socketGateway: SocketGateway) {}

  public get sockets() {
    return [...this.socketGateway.server.sockets.sockets.values()];
  }

  public get connectedUsers() {
    return this.sockets.map((el: AuthSocket) => el.user);
  }

  getUserSocket(userID) {
    return this.sockets.find((el: AuthSocket) => el.user.id === userID);
  }
}
