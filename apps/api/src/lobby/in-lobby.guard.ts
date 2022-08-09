/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   in-lobby.guard.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/08/09 13:34:13 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/09 13:55:47 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import LobbyExistGuard from './lobby-exist.guard';

@Injectable()
export default class InLobbyGuard
  extends LobbyExistGuard
  implements CanActivate
{
  canActivate(context: ExecutionContext) {
    if (!super.canActivate(context)) {
      return false;
    }
    const req = context.switchToHttp().getRequest();
    if (!req.lobby.players.has(req.user.id)) {
      throw new UnauthorizedException();
    }
    return true;
  }
}
