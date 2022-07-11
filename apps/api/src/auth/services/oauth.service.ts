import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class OAuthService {
  constructor(private readonly userService: UserService) {}

  /**
   * Log in or register via oAuth.
   * @param {Request} req : The request object.
   * @returns
   */
  async socialLogin(user) {
    // nb : passport middleware adds the user to the request object.
    if (!user) {
      throw new BadRequestException('No account presented.');
    }

    // if there's as user already registered under that email, return it
    const existingUser: User = await this.userService.find({ email: user.email });
    if (existingUser) {
      return existingUser;
    }

    // otherwise create an user entity and return it
    const newUser = await this.userService.createUser({
      ...user,
      emailVerified: true,
    });
    return newUser;
  }
}
