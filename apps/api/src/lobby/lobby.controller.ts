/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   lobby.controller.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/13 02:59:56 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/17 03:56:55 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  Param,
  Logger,
  Post,
} from '@nestjs/common';
import { CurrentLobby, CurrentUser } from 'src/decorators';
import Lobby from 'src/game/lobby.class';
import JwtGuard from 'src/guards/jwt.guard';
import InLobbyGuard from './guards/in-lobby.guard';
import IsLobbyHost from './guards/is-lobby-host.guard';
import LobbyExistGuard from './guards/lobby-exist.guard';
import SocketGuard from './guards/socket.guard';
import { LobbyService } from './lobby.service';
import { SocketService } from 'src/socket';
import { User, UserService } from 'src/user';

@UseGuards(JwtGuard, LobbyExistGuard)
@Controller('/lobbies/:id')
export class LobbyController {
  constructor(
    private readonly lobbyService: LobbyService,
    private readonly socketService: SocketService,
    private readonly userService: UserService,
  ) {}

  logger = new Logger('LobbyController');

  @Get()
  @UseGuards(InLobbyGuard)
  getLobby(@CurrentLobby() lobby): Lobby {
    return lobby;
  }

  @Get('join')
  // @UseGuards(SocketGuard)
  async getLobbyAndJoin(
    @CurrentUser() user,
    @CurrentLobby() lobby: Lobby,
  ): Promise<Lobby> {
    this.lobbyService.userJoinLobby(lobby, user);
    return lobby;
  }

  @Post('invite/:userId')
  // @UseGuards(SocketGuard)
  async inviteUserToLobby(
    @CurrentUser() user,
    @CurrentLobby() lobby: Lobby,
    @Param('userId') userId: string,
  ): Promise<void> {
    this.logger.log(`@Get('invite/:userId), userId = ${userId}`);
    const invitee = await this.userService.findById(+userId);
    this.logger.log(`@Get('invite/:userId), invitee.name = ${invitee.name}`);
    this.lobbyService.inviteUserToLobby(lobby, user, invitee);
  }

  @Get('start')
  @UseGuards(IsLobbyHost)
  startGame(@CurrentLobby() lobby: Lobby): boolean {
    lobby.start();
    this.socketService.socketio
      .except(lobby.roomId)
      .emit('online', { type: 'game_start' });
    return true;
  }

  @Get('game')
  @UseGuards(InLobbyGuard)
  gameInfos(@CurrentLobby() lobby: Lobby, @CurrentUser() user: User) {
    const player = lobby.game.players.get(user.id);
    if (player.afkInterval) {
      player.unsetAfk(() => {
        lobby.game.resume();
      });
    }
    return lobby.game.netScheme;
  }

  @Put()
  @UseGuards(IsLobbyHost)
  updateLobby(@CurrentLobby() lobby: Lobby, @Body() datas) {
    lobby.configure(datas);
    return lobby;
  }
}
