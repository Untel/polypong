/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   lobby.controller.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/13 02:59:56 by adda-sil          #+#    #+#             */
/*   Updated: 2022/07/19 01:46:04 by adda-sil         ###   ########.fr       */
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
import { LobbyService } from './lobby.service';

@UseGuards(JwtGuard)
@Controller('lobbies')
export class LobbyController {
  constructor(private readonly lobbyService: LobbyService) {}

  @Get()
  async lobbies(): Promise<Lobby[]> {
    return this.lobbyService.getLobbies();
  }

  @Get('/:id')
  async getLobby(@Param('id') id: LobbyId): Promise<Lobby> {
    const lobby = this.lobbyService.getLobby(id);
    return lobby;
  }

  @Get('/:id/join')
  @UseInterceptors(ClassSerializerInterceptor)
  async getLobbyAndJoin(
    @CurrentUser() user,
    @Param('id') id: LobbyId,
  ): Promise<Lobby> {
    console.log('Joining lobby', id, user);
    const lobby = this.lobbyService.getAndJoinLobby(id, user);
    if (!lobby) {
      throw new UnauthorizedException('Unknown lobby');
    }
    // const socketOfJoiningUser = this.so
    console.log("GEt looby and join", lobby);
    return lobby;
  }

  @Post()
  @UseInterceptors(ClassSerializerInterceptor)
  createLobby(@CurrentUser() user, @Body('name') name) {
    const lobby = this.lobbyService.createLobby(user);
    return lobby;
  }

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
