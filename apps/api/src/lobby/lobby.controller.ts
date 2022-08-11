/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   lobby.controller.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/13 02:59:56 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/11 01:36:59 by adda-sil         ###   ########.fr       */
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
import { CurrentLobby, CurrentUser } from 'src/decorators';
import { CurrentSocket } from 'src/decorators/socket.decorator';
import Game from 'src/game/game.class';
import Lobby, { LobbyId } from 'src/game/lobby.class';
import JwtGuard from 'src/guards/jwt.guard';
import { AuthSocket } from 'src/socket/ws-auth.middleware';
import InLobbyGuard from './guards/in-lobby.guard';
import IsLobbyHost from './guards/is-lobby-host.guard';
import LobbyExistGuard from './guards/lobby-exist.guard';
import SocketGuard from './guards/socket.guard';
import { LobbyService } from './lobby.service';

@UseGuards(JwtGuard, LobbyExistGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('/lobbies/:id')
export class LobbyController {
  constructor(private readonly lobbyService: LobbyService) {}
  @Get()
  @UseGuards(InLobbyGuard)
  getLobby(@CurrentLobby() lobby): Lobby {
    return lobby;
  }

  @Get('join')
  @UseGuards(SocketGuard)
  async getLobbyAndJoin(
    @CurrentUser() user,
    @CurrentLobby() lobby: Lobby,
    @CurrentSocket() socket: AuthSocket,
  ): Promise<Lobby> {
    this.lobbyService.userJoinLobby(lobby, user);
    return lobby;
  }

  @Get('start')
  @UseGuards(IsLobbyHost)
  startGame(@CurrentLobby() lobby: Lobby): boolean {
    lobby.start();
    return true;
  }

  @Get('game')
  @UseGuards(InLobbyGuard)
  gameInfos(@CurrentLobby() lobby: Lobby) {
    return lobby.game.netScheme;
  }

  @Put()
  @UseGuards(IsLobbyHost)
  updateLobby(@CurrentLobby() lobby: Lobby, @Body() datas) {
    lobby.configure(datas);
    return lobby;
    // this.lobbyService.updateLobby(host.id);
  }
}
