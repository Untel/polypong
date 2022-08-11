import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import Lobby from 'src/game/lobby.class';

export const CurrentLobby = createParamDecorator<
  unknown,
  ExecutionContext,
  Lobby
>((data: unknown, ctx: ExecutionContext): Lobby => {
  const request = ctx.switchToHttp().getRequest();
  return request.lobby as Lobby;
});
