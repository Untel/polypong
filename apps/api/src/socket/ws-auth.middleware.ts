import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { UserService } from 'src/user/user.service';
import { AuthService, UserJwtPayload } from 'src/auth/services/auth.service';
import { User } from 'src/user';
import { JwtPayload } from 'jsonwebtoken';

export interface AuthSocket extends Socket {
  user: UserJwtPayload;
}
export type SocketMiddleware = (
  socket: Socket,
  next: (err?: Error) => void,
) => void;
export const WSAuthMiddleware = (
  authService: AuthService,
): SocketMiddleware => {
  return async (socket: AuthSocket, next) => {
    try {
      const token = socket.handshake.auth.token ?? '';
      const userResult: UserJwtPayload =
        await authService.findUserByAccessToken(token);
      console.log('Socket middleware', userResult);
      if (userResult) {
        socket.user = userResult;
        next();
      } else {
        next({
          name: 'Unauthorizaed',
          message: 'Unauthorizaed',
        });
      }
    } catch (error) {
      next({
        name: 'Unauthorizaed',
        message: 'Unauthorizaed',
      });
    }
  }
}
