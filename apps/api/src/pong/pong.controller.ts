/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   pong.controller.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: edal--ce <edal--ce@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/13 02:59:56 by adda-sil          #+#    #+#             */
/*   Updated: 2022/06/27 17:08:00 by edal--ce         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Controller, Get, Delete, Param } from '@nestjs/common';
import Lobby from 'src/game/lobby.class';
import { PongService } from './pong.service';

@Controller('pong')
export class PongController {
  constructor(private readonly pongService: PongService) { }

  @Get('lobbies')
  lobbies(): Lobby[] {
    return this.pongService.getLobbies();
  }

  @Get('lobby')
  lobby(@Param('id') id: number): Lobby {
    return this.pongService.getLobby(id);
  }

  @Get('pause')
  togglePause(): boolean {
    return this.pongService.togglePause();
  }

  @Get('tick')
  tick() {
    this.pongService.updatePaddlePercent(null, 0.5);
    return JSON.parse(JSON.stringify(this.pongService.tick()));
  }

  @Delete('lobbies')
  clear() {
    this.pongService.clearLobbies();
  }
  @Get('reset')
  reset() {
    this.pongService.reset();
  }
}
