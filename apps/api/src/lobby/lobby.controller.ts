/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   lobby.controller.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/13 02:59:56 by adda-sil          #+#    #+#             */
/*   Updated: 2022/07/14 03:18:18 by adda-sil         ###   ########.fr       */
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
  @Post()
  @UseInterceptors(ClassSerializerInterceptor)
  createLobby(@Req() req: RequestWithUser, @Body('name') name) {
    const host = req.user;
    const lobby = this.lobbyService.createLobby(host);
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
