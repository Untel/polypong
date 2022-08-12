import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { HttpArgumentsHost, WsArgumentsHost } from '@nestjs/common/interfaces';
import { AuthGuard } from '@nestjs/passport';
import { Socket } from 'socket.io';
import { JwtSimpleStrategy } from 'src/auth';

@Injectable()
export default class JwtSimpleGuard
  extends AuthGuard('jwt-simple')
  implements CanActivate
{
  constructor() {
    super();
  }

  logger = new Logger('SimpleJwtGuard');

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
        this.logger.warn('Unhandled execution context' + context.getType());
        break;
    }
  }

  canActivate(context: ExecutionContext) {
    this.logger.verbose(`canActivate - context = ${context}`);
    return super.canActivate(context) as boolean;
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      throw err || new Error();
    }
    return user;
  }
}
