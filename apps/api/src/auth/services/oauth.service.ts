/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   oauth.service.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/08/14 00:54:59 by adda-sil          #+#    #+#             */
/*   Updated: 2022/09/08 18:49:41 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { faker } from '@faker-js/faker';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class OAuthService {
  constructor(private readonly userService: UserService) {}

  logger = new Logger('OAuthService');

  /**
   * Log in or register via oAuth.
   * @param {Request} req : The request object.
   * @returns
   */
  async socialLogin(user: Partial<User>) {
    this.logger.log(`socialLogin - user = ${JSON.stringify(user)}`);
    // nb : passport middleware adds the user to the request object.
    if (!user) {
      throw new BadRequestException('No account presented.');
    }

    // if there's as user already registered under that email, return it
    const existingUser: User = await this.userService.find({
      email: user.email,
    });
    if (existingUser) {
      return existingUser;
    }

    const loginStillExist = await User.find({ where: { name: user.name } });
    if (loginStillExist) user.name += `_${faker.random.word()}`;
    // otherwise create an user entity and return it
    const newUser = await this.userService.createUser({
      ...user,
      emailVerified: true,
    });
    return newUser;
  }
}
