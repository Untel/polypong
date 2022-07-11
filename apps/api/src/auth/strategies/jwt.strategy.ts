import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Req } from '@nestjs/common';
import { Request } from 'express';
import { UserService } from 'src/user/user.service';
import TokenPayload from '../interfaces/tokenPayload.interface';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/user';
import { JwtPayload } from 'jsonwebtoken';

// this strategy extends the default passport JWT strategy.
// this strategy reads the token from the cookie when the user
// requests data. Upon successfully accessing the token, we use
// the user's id contained within, and use that to fetch that user's
// data from the db.
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

  validate(user: JwtPayload) {
    console.log('===> Validating', user.exp);
    // Ya un soucis si on delete pas ca, a check
    delete user.exp;
    return user;
  }
}
