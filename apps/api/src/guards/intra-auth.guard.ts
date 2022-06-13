import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class IntraOAuthGuard extends AuthGuard('intra') {
  async canActivate(context: ExecutionContext) {
    console.log('One');
    const activate = (await super.canActivate(context)) as boolean;
    console.log('two');

    const request = context.switchToHttp().getRequest();
    console.log('tree');

    await super.logIn(request);
    console.log('four');

    return activate;
  }
}
