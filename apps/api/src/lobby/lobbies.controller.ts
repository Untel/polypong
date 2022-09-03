/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   lobbies.controller.ts                              :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: edal--ce <edal--ce@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/13 02:59:56 by adda-sil          #+#    #+#             */
/*   Updated: 2022/09/03 05:19:19 by edal--ce         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  Delete,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from 'src/decorators';
import { Roles } from 'src/decorators/roles.decorator';
import Lobby from 'src/game/lobby.class';
import JwtGuard from 'src/guards/jwt.guard';

import { LobbyService } from './lobby.service';

@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('lobbies')
export class LobbiesController {
  constructor(private readonly lobbyService: LobbyService) {}

  @Get()
  async lobbies(): Promise<Lobby[]> {
    return this.lobbyService.getLobbies();
  }

  @Get('matchmake')
  async matchmake(@CurrentUser() user): Promise<Lobby> {
    return this.lobbyService.userMatchmake(user);
  }
  @Post()
  async createLobby(@CurrentUser() user, @Body('name') name): Promise<Lobby> {
    const lobby = await this.lobbyService.createLobby(user, name);
    return lobby;
  }

  // @Roles('admin')
  @Delete()
  clear() {
    console.log('Clearing lobbies');
    this.lobbyService.clearLobbies();
  }
}
