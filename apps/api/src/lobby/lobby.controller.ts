/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   lobby.controller.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/13 02:59:56 by adda-sil          #+#    #+#             */
/*   Updated: 2022/07/05 01:10:45 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Controller, Get, Delete, Param } from '@nestjs/common';
import Lobby from 'src/game/lobby.class';
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
  lobby(@Param('id') id: number): Lobby {
    return this.lobbyService.getLobby(id);
  }

  // @Get('/createLobby')
  // create() : Lobby {
  //   return this.lobbyService.createLobby();
  // }
}
