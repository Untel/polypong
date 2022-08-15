/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   jwt-two-factor.strategy.ts                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/08/14 00:55:16 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/14 00:55:17 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import TokenPayload from '../interfaces/tokenPayload.interface';
import { ConfigService } from '@nestjs/config';

// this strategy checks if the 2f authentication was successfull
@Injectable()
export class JwtTwoFactorStrategy extends PassportStrategy(
  Strategy,
  'jwt-two-factor',
) {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {
    console.log('===> JWT TWO FACTOR STRATEGY');
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: TokenPayload) {
    const user = await this.userService.findById(payload.id);
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
