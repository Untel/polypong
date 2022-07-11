/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   lobby.controller.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/13 02:59:56 by adda-sil          #+#    #+#             */
/*   Updated: 2022/07/11 23:25:19 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Controller, Get, Post, Delete, Param, Body, Req } from '@nestjs/common';
import RequestWithUser from 'src/auth/interfaces/requestWithUser.interface';
import Lobby, { LobbyId } from 'src/game/lobby.class';
import { LobbyService } from './lobby.service';

@Controller('lobbies')
export class LobbyController {
  constructor(
    private readonly lobbyService: LobbyService,
  ) {}

  @Get()
  lobbies(): Promise<Lobby[]> {
    return this.lobbyService.getLobbies();
  }

  @Get('/:id')
  async getLobby(@Param('id') id: LobbyId): Promise<Lobby> {
    const lobby = await this.lobbyService.getLobby(id);
    return lobby;
  }

  @Post('/create')
  createLobby(@Req() req: RequestWithUser) {
    console.log("Create lobby", req.user.name);
    const host = req.user;
    this.lobbyService.createLobby(
      host.id
    );
  }

  // @Get('/createLobby')
  // create() : Lobby {
  //   return this.lobbyService.createLobby();
  // }
}
