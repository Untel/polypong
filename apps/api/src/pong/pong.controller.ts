/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   pong.controller.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/13 02:59:56 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/15 11:56:13 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Controller, Get, UseGuards } from '@nestjs/common';
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
    if (lobby.game.isStopped) lobby.game.run();
    else lobby.game.stop();
    return lobby.game.isStopped;
  }

  @Get('tick')
  tick(@CurrentLobby() lobby: Lobby) {
    lobby.game.stop();
    return lobby.game.tick();
  }

  @Get('restart')
  async restart(@CurrentLobby() lobby: Lobby) {
    return (await lobby.start()).netScheme;
  }
}
