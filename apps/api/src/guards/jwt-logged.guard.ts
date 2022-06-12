import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthService } from 'src/auth/services/auth.service';

@Injectable()
export class JwtLoggedGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // const bearerToken = context.args[0].handshake.headers.authorization.split(' ')[1];
    console.log("Special context", context);
    const req = context.getArgByIndex(0);
    const cookie = req.handshake.headers.cookie;
    const reg = /(?<=Authentication=)[^;]*/gi; // REGEX MADE BY ANDY OLALA
    const token = reg.exec(cookie)[0];

    const user = await this.authService.verifyToken(token);
    console.log("Web socket user", user);
    (context as any).user = user;
    return !!user;
  }
}
