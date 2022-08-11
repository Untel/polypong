/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   pong.controller.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/13 02:59:56 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/11 19:56:41 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Controller, Get, Delete, Param, UseGuards } from '@nestjs/common';
import { CurrentLobby } from 'src/decorators';
import Lobby from 'src/game/lobby.class';
import JwtGuard from 'src/guards/jwt.guard';
import LobbyExistGuard from 'src/lobby/guards/lobby-exist.guard';
// import JwtGuard from 'src/guards/jwt.guard';
// import LobbyExistGuard, { CurrentLobby } from 'src/lobby/lobby-exist.guard';
import { PongService } from './pong.service';

@UseGuards(JwtGuard, LobbyExistGuard)
@Controller('lobbies/:id/game')
export class PongController {
  constructor(private readonly pongService: PongService) {}

  @Get('pause')
  togglePause(@CurrentLobby() lobby: Lobby): boolean {
    console.log('Lobby is', lobby.name);
    if (lobby.game.isPaused) lobby.game.run();
    else lobby.game.stop();
    return lobby.game.isPaused;
  }

  @Get('tick')
  tick(@CurrentLobby() lobby: Lobby) {
    lobby.game.stop();
    return lobby.game.tick();
  }

  @Get('restart')
  restart(@CurrentLobby() lobby: Lobby) {
    lobby.start();
    return lobby.game;
  }

  @Get('reset')
  reset(@CurrentLobby() lobby: Lobby) {
    lobby.game.stop();
    lobby.game.reset();
    return lobby.game;
  }
}
