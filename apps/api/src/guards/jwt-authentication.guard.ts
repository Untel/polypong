import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export default class JwtAuthenticationGuard extends AuthGuard('jwt') implements CanActivate {

  constructor() {
    super();
  }

  canActivate(context: ExecutionContext) {
    // const bearerToken = context.args[0].handshake.headers.authorization.split(' ')[1];
    // const req = context.switchToHttp().getRequest();
    // console.log("Context wss", context);
    const parentCanActivate = (super.canActivate(context) as boolean);
    return parentCanActivate;
  }

  handleRequest(err, user, info) {
    console.log("Handling the request", err, user, info);
    if (err || !user) {
      throw err || new Error();
    }
    return user;
  }

}
