import { Controller, Get, Delete } from '@nestjs/common';
import Lobby from 'src/game/lobby.class';
import { PongService } from './pong.service';

@Controller('pong')
export class PongController {
  constructor(private readonly pongService: PongService) {}

  @Get('lobbies')
  lobbies(): Lobby[] {
    return this.pongService.getLobbies();
  }

  @Delete('lobbies')
  clear() {
    this.pongService.clearLobbies();
  }
}
