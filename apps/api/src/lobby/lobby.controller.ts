/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   lobby.controller.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/13 02:59:56 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/09 12:43:53 by adda-sil         ###   ########.fr       */
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
import { AuthGuard } from '@nestjs/passport';
import RequestWithUser from 'src/auth/interfaces/requestWithUser.interface';
import { CurrentUser } from 'src/auth/user.decorator';
import Lobby, { LobbyId } from 'src/game/lobby.class';
import JwtGuard from 'src/guards/jwt.guard';
import InLobbyGuard, { CurrentLobby } from './in-lobby.guard';
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
  async getLobbyAndJoin(
    @CurrentUser() user,
    @Param('id') id: LobbyId,
  ): Promise<Lobby> {
    const lobby = this.lobbyService.getAndJoinLobby(id, user);
    if (!lobby) {
      throw new UnauthorizedException('Unknown lobby');
    }
    return lobby;
  }

  @Get('/:id/start')
  startGame(@Param('id') id: LobbyId): boolean {
    this.lobbyService.startGame(id);
    return true;
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
