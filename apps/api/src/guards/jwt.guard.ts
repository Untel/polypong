/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   jwt.guard.ts                                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/08/09 13:34:08 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/09 13:34:09 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
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
        this.logger.log(
          `getRequest - http - returning context.switchToHttp().getRequest()`,
        );
        return context.switchToHttp().getRequest();
      default:
        console.log('Unhandled execution context', context.getType());
        break;
    }
  }

  canActivate(context: ExecutionContext) {
    this.logger.log(`canActivate - context = ${context}`);
    // console.log("Parent activate ctx");
    return super.canActivate(context) as boolean;
  }

  handleRequest(err, user, info) {
    // console.log("===> JWT HANDLE");
    // console.log('Handling the request', err, user, info);
    this.logger.log(`handleRequest - user = ${JSON.stringify(user)}`);
    if (err || !user) {
      throw err || new Error();
    }
    return user;
  }
}
