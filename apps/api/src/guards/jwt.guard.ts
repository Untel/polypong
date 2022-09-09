/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   jwt.guard.ts                                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/08/09 13:34:08 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/09 18:47:18 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { HttpArgumentsHost, WsArgumentsHost } from '@nestjs/common/interfaces';
import { AuthGuard } from '@nestjs/passport';
import { Socket } from 'socket.io';

@Injectable()
export default class JwtGuard extends AuthGuard('jwt') implements CanActivate {
  constructor() {
    super();
  }

  logger = new Logger('JwtGuard');

  getRequest(context: ExecutionContext) {
    switch (context.getType()) {
      case 'ws':
        const args = context.switchToWs().getClient();
        const token = args.handshake?.auth?.token;
        return {
          headers: {
            authorization: `Bearer ${token}`,
          },
        };
      case 'http':
        return context.switchToHttp().getRequest();
      default:
        console.log('Unhandled execution context', context.getType());
        break;
    }
  }

  canActivate(context: ExecutionContext) {
    return super.canActivate(context) as boolean;
  }

  handleRequest(err, user) {
    if (err || !user) {
      throw err || new UnauthorizedException('token invalid');
    }
    return user;
  }
}
