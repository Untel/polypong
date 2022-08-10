/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   in-lobby.guard.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/08/09 13:34:13 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/09 19:55:22 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export default class InLobbyGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    if (!req.lobby.players.has(req.user.id)) {
      throw new UnauthorizedException();
    }
    return true;
  }
}
