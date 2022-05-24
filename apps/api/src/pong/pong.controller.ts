import { Controller, Get } from '@nestjs/common';
import Lobby from 'src/game/lobby.class';
import { PongService } from './pong.service';

@Controller()
export class PongController {
  constructor(private readonly pongService: PongService) {}

  @Get()
  getLobbies(): Lobby[] {
    return this.pongService.getLobbies();
  }
}
