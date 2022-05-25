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

  @Delete('lobbies')
  clear() {
    this.pongService.clearLobbies();
  }
}
