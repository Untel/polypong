import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from 'jsonwebtoken';

@Injectable()
export class JwtSimpleStrategy extends PassportStrategy(
  Strategy,
  'jwt-simple',
) {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {
    console.log('===> JWT SIMPLE STRATEGY');
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  logger = new Logger('JwtSimpleStrategy');

  async validate(userJwtPayload: JwtPayload) {
    this.logger.log(
      `validate - userJWtPayload = ${JSON.stringify(userJwtPayload)}`,
    );
    // Ya un soucis si on delete pas ca, a check
    delete userJwtPayload.exp;
    const user = await this.userService.findById(userJwtPayload.id);
    this.logger.log(`validate - user = ${JSON.stringify(user)}`);
    return user;
  }
}
