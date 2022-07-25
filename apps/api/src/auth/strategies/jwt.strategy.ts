import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger, Req } from '@nestjs/common';
import { Request } from 'express';
import { UserService } from 'src/user/user.service';
import TokenPayload from '../interfaces/tokenPayload.interface';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/user';
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

  validate(user: JwtPayload) {
    this.logger.log(`===>Validating`);
    // Ya un soucis si on delete pas ca, a check
    delete user.exp;
    return user;
  }
}
