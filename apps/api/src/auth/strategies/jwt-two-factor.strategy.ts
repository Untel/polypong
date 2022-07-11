import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { UserService } from 'src/user/user.service';
import TokenPayload from '../interfaces/tokenPayload.interface';

// this strategy checks if the 2f authentication was successfull
@Injectable()
export class JwtTwoFactorStrategy extends PassportStrategy(
  Strategy,
  'jwt-two-factor',
) {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: TokenPayload) {
    const user = await this.userService.findById(payload.userId);
    // if 2fa isn't enabled, we just return the user
    if (!user.isTwoFactorAuthenticationEnabled) {
      return user;
    }
    // otherwise, we check if the token contains the 'is2fa' flag
    if (payload.is2fa) {
      return user;
    }
  }
}
