import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class IntraOAuthGuard extends AuthGuard('intra') {
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    const redirect = { ...request.query };
    console.log('one', redirect);

    const activate = (await super.canActivate(context)) as boolean;
    console.log('two');

    console.log('tree', redirect);
    return activate;
  }
}
