/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   lobby.controller.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/13 02:59:56 by adda-sil          #+#    #+#             */
/*   Updated: 2022/07/15 09:01:23 by adda-sil         ###   ########.fr       */
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
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import RequestWithUser from 'src/auth/interfaces/requestWithUser.interface';
import { CurrentUser } from 'src/auth/user.decorator';
import Lobby, { LobbyId } from 'src/game/lobby.class';
import JwtGuard from 'src/guards/jwt.guard';
import { LobbyService } from './lobby.service';

@Controller('lobbies')
export class LobbyController {
  constructor(private readonly lobbyService: LobbyService) {}

  @UseGuards(JwtGuard)
  @Get()
  async lobbies(): Promise<Lobby[]> {
    return this.lobbyService.getLobbies();
  }

  @UseGuards(JwtGuard)
  @Get('/:id')
  async getLobby(@Param('id') id: LobbyId): Promise<Lobby> {
    const lobby = this.lobbyService.getLobby(id);
    return lobby;
  }

  @UseGuards(JwtGuard)
  @Get('/:id/join')
  async getLobbyAndJoin(
    @CurrentUser() user,
    @Param('id') id: LobbyId,
  ): Promise<Lobby> {
    console.log('Joining lobby', id, user);
    const lobby = this.lobbyService.getAndJoinLobby(id, user);
    // const socketOfJoiningUser = this.so
    return lobby;
  }

  @UseGuards(JwtGuard)
  @Post()
  @UseInterceptors(ClassSerializerInterceptor)
  createLobby(@CurrentUser() user, @Body('name') name) {
    const lobby = this.lobbyService.createLobby(user);
    return lobby;
  }

  @UseGuards(JwtGuard)
  @Put()
  updateLobby(@Req() req: RequestWithUser, @Body('name') name) {
    console.log('Create lobby', req.user.name, name);
    const host = req.user;
    // this.lobbyService.updateLobby(host.id);
  }

  // @Get('/createLobby')
  // create() : Lobby {
  //   return this.lobbyService.createLobby();
  // }
}
