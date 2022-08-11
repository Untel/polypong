/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   is-lobby-host.guard.ts                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/08/09 13:34:13 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/10 21:51:27 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export default class IsLobbyHost implements CanActivate {
  canActivate(context: ExecutionContext) {
    console.log('IS LOBBY HOST');
    const req = context.switchToHttp().getRequest();
    if (!(req.lobby.host.id === req.user.id)) {
      throw new UnauthorizedException('Only host can do that');
    }
    return true;
  }
}
