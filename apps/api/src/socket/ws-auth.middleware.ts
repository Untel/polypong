import { Socket } from 'socket.io';
import { AuthService } from 'src/auth/services/auth.service';
import { User } from 'src/user';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import Lobby from 'src/game/lobby.class';

export type SocketData = { user: User; lobby?: Lobby };
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
