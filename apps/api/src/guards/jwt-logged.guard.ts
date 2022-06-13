import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthService } from 'src/auth/services/auth.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class JwtLoggedGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // const bearerToken = context.args[0].handshake.headers.authorization.split(' ')[1];
    console.log('WEB SOCKET GUARD Special context', context);
    const req = context.getArgByIndex(0);
    const cookie = req.handshake?.headers?.cookie;
    const decodedToken = await this.authService.decodeTokenFromCookie(cookie);
    const user = await this.userService.findById(decodedToken.userId);
    req.user = user;
    return !!user;
  }
}
