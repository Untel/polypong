import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { UserService } from 'src/user/user.service';
import TokenPayload from '../interfaces/tokenPayload.interface';
import { ConfigService } from '@nestjs/config';

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
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // jwtFromRequest: ExtractJwt.fromExtractors([(request: Request) => {
      //   return request?.cookies?.Authentication;
      // }]),
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: TokenPayload) {
    console.log("Validating", payload);
    return await this.userService.findById(payload.userId);
  }
}
