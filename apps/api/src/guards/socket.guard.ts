/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   socket.guard.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/08/09 13:34:13 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/09 20:06:30 by adda-sil         ###   ########.fr       */
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
import { AuthSocket, SocketService } from 'src/socket';

@Injectable()
export default class SocketGuard implements CanActivate {
  constructor(private readonly socketService: SocketService) {}

  canActivate(context: ExecutionContext) {
    console.log('HAS SOCKET EXIST');
    const req = context.switchToHttp().getRequest();
    const sock = this.socketService.getUserSocket(req.user.id);
    req.socket = sock;
    return !!sock;
  }
}

export const CurrentSocket = createParamDecorator<
  unknown,
  ExecutionContext,
  AuthSocket
>((data: unknown, ctx: ExecutionContext): AuthSocket => {
  const request = ctx.switchToHttp().getRequest();
  return request.socket as AuthSocket;
});
