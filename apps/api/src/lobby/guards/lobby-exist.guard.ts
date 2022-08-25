/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   lobby-exist.guard.ts                               :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/08/09 13:34:13 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/10 22:03:10 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { LobbyService } from 'src/lobby/lobby.service';

@Injectable()
export default class LobbyExistGuard implements CanActivate {
  constructor(private readonly lobbyService: LobbyService) {}

  getRequest(context: ExecutionContext) {
    switch (context.getType()) {
      case 'ws':
        return context.switchToWs().getClient();
      case 'http':
        return context.switchToHttp().getRequest();
      default:
        console.log('Unhandled execution context', context.getType());
        break;
    }
  }

  getUser(context: ExecutionContext) {
    const req = this.getRequest(context);
    return req.user;
  }

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
