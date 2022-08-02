import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { UserService } from 'src/user/user.service';
import { AuthService, UserJwtPayload } from 'src/auth/services/auth.service';
import { User } from 'src/user';
import { JwtPayload } from 'jsonwebtoken';
import { UnauthorizedException } from '@nestjs/common';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import Lobby from 'src/game/lobby.class';

// export interface AuthSocket extends Socket {
//   user: UserJwtPayload;
// }
export type SocketData = { user: AuthSocket; lobby?: Lobby };
export type AuthSocket = Socket<DefaultEventsMap, DefaultEventsMap, SocketData>;
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
      const userResult: User = (await authService.findUserByAccessToken(
        token,
      )) as User;
      console.log('Socket middleware', userResult);
      if (userResult) {
        socket.data.user = userResult;
        next();
      } else {
        next(new Error('unauthorized'));
      }
    } catch (error) {
      next(new Error('unauthorized'));
    }
  };
};
