/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   local.strategy.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/08/14 00:55:24 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/14 00:55:25 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

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
