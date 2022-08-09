/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   in-lobby.guard.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/08/09 13:34:13 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/09 13:34:14 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
  createParamDecorator,
} from '@nestjs/common';
import Lobby from 'src/game/lobby.class';
import { LobbyService } from './lobby.service';

@Injectable()
export default class InLobbyGuard implements CanActivate {
  constructor(private readonly lobbyService: LobbyService) {}

  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const params = req.params;
    const lobbyId = +params.id;
    const user = req.user;

    const lobby = this.lobbyService.getLobby(lobbyId);
    if (!lobby) {
      throw new UnprocessableEntityException();
    }
    if (!lobby.players.has(user.id)) {
      throw new UnauthorizedException();
    }
    req.lobby = lobby;
    return true;
  }
}

export const CurrentLobby = createParamDecorator<Lobby>(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.lobby;
  },
);
