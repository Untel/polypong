import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { HttpArgumentsHost, WsArgumentsHost } from '@nestjs/common/interfaces';
import { AuthGuard } from '@nestjs/passport';
import { Socket } from 'socket.io';

@Injectable()
export default class JwtGuard
  extends AuthGuard('jwt')
  implements CanActivate
{
  constructor() {
    super();
  }

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
        console.log("Unhandled execution context", context.getType());
        break ;
    }
  }

  canActivate(context: ExecutionContext) {
    // console.log("Parent activate ctx");
    return super.canActivate(context) as boolean;
  }

  handleRequest(err, user, info) {
    // console.log("===> JWT HANDLE");
    // console.log('Handling the request', err, user, info);
    if (err || !user) {
      console.log('ERRERERERERERRE');
      throw err || new Error();
    }
    return user;
  }
}
