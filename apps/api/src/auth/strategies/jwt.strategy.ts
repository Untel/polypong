import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from 'jsonwebtoken';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  logger = new Logger('JwtStrategy');

  async validate(userJwtPayload: JwtPayload) {
    // Ya un soucis si on delete pas ca, a check
    delete userJwtPayload.exp;
    const user = await this.userService.findById(userJwtPayload.id);
    // this.logger.log(`validate - user = ${JSON.stringify(user)}`);
    // if 2fa not required, just return the user
    if (user.isTwoFactorAuthenticationEnabled == false) {
      return user;
    }
    // otherwise check if the token was signed after a two-factor auth
    if (userJwtPayload.is2fa) {
      return user;
    } else {
      throw new UnauthorizedException('2FA');
    }
  }
}
