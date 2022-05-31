import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { util } from 'prettier';

@Injectable()
export class LoggedInGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log("Context wss", context);
    const req = context.switchToHttp().getRequest();
    console.log(`in LoggedInGuard - canActivate about to return req.isAuthenticated = ${req.isAuthenticated()}`);
    return req.isAuthenticated();
  }
}
