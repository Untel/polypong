/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   is-lobby-host.guard.ts                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/08/09 13:34:13 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/09 13:55:37 by adda-sil         ###   ########.fr       */
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
export default class IsLobbyHost
  extends LobbyExistGuard
  implements CanActivate
{
  canActivate(context: ExecutionContext) {
    if (!super.canActivate(context)) {
      return false;
    }
    const req = context.switchToHttp().getRequest();
    if (!(req.lobby.host.user.id === req.user.id)) {
      throw new UnauthorizedException('Only host can do that');
    }
    return true;
  }
}
