import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthService } from 'src/auth/services/auth.service';

@Injectable()
export class JwtLoggedGuard implements CanActivate {
  // constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // const bearerToken = context.args[0].handshake.headers.authorization.split(' ')[1];
    console.log("Special context", context);
    // console.log("Context wss", context);
    // const req = context.switchToHttp().getRequest();
    // // console.log(`in LoggedInGuard - canActivate about to return req.isAuthenticated`, req);
    // return req.isAuthenticated();
    return true;
  }
}
