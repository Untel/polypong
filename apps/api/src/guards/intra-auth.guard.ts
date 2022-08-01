import { Injectable, ExecutionContext, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class IntraOAuthGuard extends AuthGuard('intra') {

  logger = new Logger('IntraOauthGuard');

  async canActivate(context: ExecutionContext) {
    this.logger.log('entered oauthguard');
    const request = context.switchToHttp().getRequest();
    this.logger.log(`zero - after getRequest() - request.query = ${JSON.stringify(request.query)}`);

    const redirect = { ...request.query };
    this.logger.log(`one - { ...request.query } = ${JSON.stringify(redirect)}`);

    const activate = (await super.canActivate(context)) as boolean;
    this.logger.log(`two - super. = ${JSON.stringify(activate)}`);

    this.logger.log(`three - redirect = ${JSON.stringify(redirect)}`);
    return activate;
  }
}
