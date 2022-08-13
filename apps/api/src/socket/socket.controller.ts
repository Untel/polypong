/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   socket.controller.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/13 02:59:56 by adda-sil          #+#    #+#             */
/*   Updated: 2022/07/09 19:45:57 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Controller, Get, Delete, Param } from '@nestjs/common';
import { AuthSocket } from './ws-auth.middleware';
import { SocketService } from './socket.service';
import { User } from 'src/user';
import Lobby from 'src/game/lobby.class';

export class UserWithLobby extends User {
  inLobby: boolean;
  inGame: boolean;
}

@Controller('online')
export class SocketController {
  constructor(private readonly socketService: SocketService) {}

  @Get()
  async getConnectedUsers(): Promise<UserWithLobby[]> {
    const res = await this.socketService.connectedUsers();
    return res;
  }
}
