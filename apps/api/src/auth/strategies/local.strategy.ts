import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../services/auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  logger = new Logger();

  async validate(username: string, password: string) {
    this.logger.log(
      'in LocalStrategy - validate, about to call authService.validateUser',
    );
    const user = await this.authService.validateUser(username, password);
    this.logger.log(`in LocalStrategy - validate, user.name = ${user.name}`);

    if (!user) {
      this.logger.log('in LocalStrategy, !user doesnt exist');
      throw new UnauthorizedException();
    }

    return user;
  }
}
