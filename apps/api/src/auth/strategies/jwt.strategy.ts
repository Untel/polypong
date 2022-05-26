import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { UserService } from 'src/user/user.service';
import TokenPayload from '../interfaces/tokenPayload.interface';
 
// this strategy extends the default passport JWT strategy.
// this strategy reads the token from the cookie when the user
// requests data. Upon successfully accessing the token, we use
// the user's id contained within, and use that to fetch that user's
// data from the db.
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([(request: Request) => {
        return request?.cookies?.Authentication;
      }]),
      secretOrKey: process.env.JWT_SECRET,
    });
  }
 
  async validate(payload: TokenPayload) {
    return this.userService.findById(payload.userId);
  }
}