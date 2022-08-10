/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   lobby-exist.guard.ts                               :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/08/09 13:34:13 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/09 18:43:03 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnprocessableEntityException,
  createParamDecorator,
} from '@nestjs/common';
import Lobby from 'src/game/lobby.class';
import { LobbyService } from './lobby.service';

@Injectable()
export default class LobbyExistGuard implements CanActivate {
  constructor(private readonly lobbyService: LobbyService) {}

  canActivate(context: ExecutionContext) {
    console.log('LOBBY EXIST');
    const req = context.switchToHttp().getRequest();
    const params = req.params;
    const lobbyId = +params.id;
    const lobby = this.lobbyService.getLobby(lobbyId);
    if (!lobby) {
      throw new UnprocessableEntityException();
    }
    req.lobby = lobby;
    return true;
  }
}

export const CurrentLobby = createParamDecorator<
  unknown,
  ExecutionContext,
  Lobby
>((data: unknown, ctx: ExecutionContext): Lobby => {
  const request = ctx.switchToHttp().getRequest();
  return request.lobby as Lobby;
});
