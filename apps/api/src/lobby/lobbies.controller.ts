/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   lobbies.controller.ts                              :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/13 02:59:56 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/09 19:01:11 by adda-sil         ###   ########.fr       */
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
import { Roles } from 'src/auth/roles.decorator';
import { CurrentUser } from 'src/auth/user.decorator';
import Lobby from 'src/game/lobby.class';
import JwtGuard from 'src/guards/jwt.guard';

import { LobbyService } from './lobby.service';

@UseGuards(JwtGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('lobbies')
export class LobbiesController {
  constructor(private readonly lobbyService: LobbyService) {}

  @Get()
  async lobbies(): Promise<Lobby[]> {
    return this.lobbyService.getLobbies();
  }

  @Post()
  createLobby(@CurrentUser() user, @Body('name') name) {
    const lobby = this.lobbyService.createLobby(user, name);
    return lobby;
  }

  @Roles('admin')
  @Delete()
  clear() {
    this.lobbyService.clearLobbies();
  }
}
