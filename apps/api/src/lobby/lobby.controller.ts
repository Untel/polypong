/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   lobby.controller.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/13 02:59:56 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/09 16:20:11 by adda-sil         ###   ########.fr       */
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
import InLobbyGuard from './in-lobby.guard';
import IsLobbyHost from './is-lobby-host.guard';
import LobbyExistGuard, { CurrentLobby } from './lobby-exist.guard';

import { LobbyService } from './lobby.service';

@UseGuards(JwtGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('lobbies')
export class LobbyController {
  constructor(private readonly lobbyService: LobbyService) {}

  @Get()
  async lobbies(): Promise<Lobby[]> {
    return this.lobbyService.getLobbies();
  }

  @Get('/:id')
  @UseGuards(InLobbyGuard)
  async getLobby(
    // @Param('id') id: LobbyId
    @CurrentLobby() lobby,
  ): Promise<Lobby> {
    // const lobby = this.lobbyService.getLobby(id);
    console.log('Lobby guard protected', lobby);
    return lobby;
  }

  @Get('/:id/join')
  @UseGuards(LobbyExistGuard)
  async getLobbyAndJoin(
    @CurrentUser() user,
    @CurrentLobby() lobby: Lobby,
  ): Promise<Lobby> {
    return lobby;
  }

  @Get('/:id/start')
  @UseGuards(IsLobbyHost)
  startGame(
    // @Param('id') id: LobbyId,
    @CurrentLobby('lobby') lobby: Lobby,
  ): boolean {
    lobby.start();
    return true;
  }

  @Get('/:id/game')
  @UseGuards(InLobbyGuard)
  gameInfos(
    @Param('id') id: LobbyId,
    @CurrentLobby('lobby') lobby: Lobby,
  ): Game {
    return lobby.game;
  }

  @Post()
  createLobby(@CurrentUser() user, @Body('name') name) {
    const lobby = this.lobbyService.createLobby(user, name);
    return lobby;
  }

  @Put('/:id')
  updateLobby(@CurrentUser() user, @Param('id') id: LobbyId, @Body() lobby) {
    console.log('Updating', id, typeof id);
    const _lobby = this.lobbyService.updateLobby(id, lobby);
    return _lobby;
    // this.lobbyService.updateLobby(host.id);
  }
}
