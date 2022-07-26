import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from 'jsonwebtoken';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {
    console.log("===> JWT STRATEGY");
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  logger = new Logger('JwtStrategy');

  validate(userJwtPayload: JwtPayload) {
    this.logger.log(`validate - userJWtPayload = ${JSON.stringify(userJwtPayload)}`);
    // Ya un soucis si on delete pas ca, a check
    delete userJwtPayload.exp;
    return userJwtPayload;
  }
}
