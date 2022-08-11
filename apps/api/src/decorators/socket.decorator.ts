import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthSocket } from 'src/socket';

export const CurrentSocket = createParamDecorator<
  unknown,
  ExecutionContext,
  AuthSocket
>((data: unknown, ctx: ExecutionContext): AuthSocket => {
  const request = ctx.switchToHttp().getRequest();
  return request.socket as AuthSocket;
});
