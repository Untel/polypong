/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   lobby.controller.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/13 02:59:56 by adda-sil          #+#    #+#             */
/*   Updated: 2022/07/09 19:45:57 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Controller, Get, Delete, Param } from '@nestjs/common';
import Lobby, { LobbyId } from 'src/game/lobby.class';
import { LobbyService } from './lobby.service';

@Controller('lobbies')
export class LobbyController {
  constructor(
    private readonly lobbyService: LobbyService,
  ) {}

  @Get('/')
  getLobbies(): Promise<Lobby[]> {
    return this.lobbyService.getLobbies();
  }

  @Get('/:id')
  async getLobby(@Param('id') id: LobbyId): Promise<Lobby> {
    const lobby = await this.lobbyService.getLobby(id);
    return lobby;
  }

  @Get('/create')
  createLobby(@Param('id') hostId) {
    this.lobbyService.createLobby(hostId);
  }

  // @Get('/createLobby')
  // create() : Lobby {
  //   return this.lobbyService.createLobby();
  // }
}
