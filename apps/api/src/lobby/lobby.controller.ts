/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   lobby.controller.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/13 02:59:56 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/10 16:48:09 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  UnauthorizedException,
} from '@nestjs/common';
import { CurrentUser } from 'src/auth/user.decorator';
import Game from 'src/game/game.class';
import Lobby, { LobbyId } from 'src/game/lobby.class';
import JwtGuard from 'src/guards/jwt.guard';
import SocketGuard, { CurrentSocket } from 'src/guards/socket.guard';
import { AuthSocket } from 'src/socket/ws-auth.middleware';
import InLobbyGuard from './in-lobby.guard';
import IsLobbyHost from './is-lobby-host.guard';
import LobbyExistGuard, { CurrentLobby } from './lobby-exist.guard';

import { LobbyService } from './lobby.service';

@UseGuards(JwtGuard, LobbyExistGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('/lobbies/:id')
export class LobbyController {
  constructor(private readonly lobbyService: LobbyService) {}
  @Get()
  @UseGuards(InLobbyGuard)
  getLobby(
    // @Param('id') id: LobbyId
    @CurrentLobby() lobby,
  ): Lobby {
    return lobby;
  }

  @Get('join')
  @UseGuards(SocketGuard)
  async getLobbyAndJoin(
    // @Param('id') id,
    @CurrentUser() user,
    @CurrentLobby() lobby: Lobby,
    @CurrentSocket() socket: AuthSocket,
  ): Promise<Lobby> {
    this.lobbyService.userJoinLobby(lobby, user);
    return lobby;
  }

  @Get('start')
  @UseGuards(IsLobbyHost)
  startGame(
    // @Param('id') id: LobbyId,
    @CurrentLobby('lobby') lobby: Lobby,
  ): boolean {
    lobby.start();
    return true;
  }

  @Get('game')
  @UseGuards(InLobbyGuard)
  gameInfos(
    @Param('id') id: LobbyId,
    @CurrentLobby('lobby') lobby: Lobby,
  ): Game {
    return lobby.game;
  }

  @Put()
  @UseGuards(IsLobbyHost)
  updateLobby(
    @Param('id') id: LobbyId,
    @CurrentLobby('lobby') lobby: Lobby,
    @Body() datas,
  ) {
    console.log('Updating', id, typeof id);
    lobby.configure(datas);
    // const _lobby = this.lobbyService.updateLobby(lobby, datas);
    return lobby;
    // this.lobbyService.updateLobby(host.id);
  }
}
