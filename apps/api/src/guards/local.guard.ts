import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalGuard extends AuthGuard('local') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log(`in LocalGuard, in canActivate, context = ${context}`);
    const result = (await super.canActivate(context)) as boolean;
    console.log(
      `in LocalGuard, result of super.canActivate(context) = ${result}`,
    );
    return result;
  }
}
