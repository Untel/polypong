/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   password-auth.service.ts                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/08/14 00:55:02 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/14 00:55:03 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import {
  BadRequestException,
  ConsoleLogger,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as jwt from 'jsonwebtoken';
import { MailService } from 'src/mail/mail.service';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { ForgotPasswordToken } from '../entities/forgot-password-token.entity';

@Injectable()
export class PasswordService {
  constructor(
    private readonly userService: UserService,
    private readonly mailService: MailService,
    @InjectRepository(ForgotPasswordToken)
    private forgotPasswordRepository: Repository<ForgotPasswordToken>,
  ) {}

  logger = new Logger();

  /**
   * Update the password of a user.
   * @param {User} user
   *   The user object.
   * @param oldPassword
   *   The old password of the user in plain text.
   * @param newPassword
   *   The new password in plain text.
   * @returns
   */
  async changePassword(
    user: User,
    oldPassword: string,
    newPassword: string,
  ): Promise<any> {
    // Probably the password is not included in the user object. Thus, we need to reload the user and include the password.
    if (!user.password) {
      user = await this.userService.find({ id: user.id }, true);
    }
    // Check if the old password is correct.
    const isOldPasswordCorrect: boolean = await bcrypt.compare(
      oldPassword,
      user.password,
    );
    if (!isOldPasswordCorrect) {
      throw new UnauthorizedException('Old password not correct');
    }

    // Hash new password & update entity.
    const password = await bcrypt.hash(newPassword, 8);
    return await this.userService.updateUser(user.id, {
      password,
    });
  }

  /**
   * Send a reset password link to a given email that the user can then use to reset her password.
   * @param {string} email
   *   The email of the user.
   * @returns
   */
  async sendForgotPasswordLink(email: string) {
    this.logger.log('in sendForgotPasswordLink');
    const user = await this.userService.find({ email });
    // For security issues we won't throw an error if there is no user with the
    // provided email address.
    if (!user) {
      this.logger.log(`no user matching email : ${email}`);
      return;
    }

    this.logger.log('in sendForgotPasswordLink, sign token');
    // Sign a token that will expire in 5 minutes.
    const token = await jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: 60 * 5,
    });

    this.logger.log(
      'in sendForgotPasswordLink, create entry in forgotPassword table',
    );
    // Create an entry in the Forgot Password table.
    const forgotPasswordEntry = await this.forgotPasswordRepository.create({
      email,
      token,
    });
    await this.forgotPasswordRepository.save(forgotPasswordEntry);

    this.logger.log('in sendForgotPasswordLink, send the email');
    // Send email with the reset password link.
    const url = `${process.env.FRONTEND_URL}/resetPassword/token=${token}`;
    await this.mailService.sendResetPasswordLink(email, url);
  }

  /**
   * Let the user set a new password after declaring it was forgotten
   * @param {string} token : the reset token sent per mail.
   * @param newPassword : the new password the user wants to set.
   * @returns
   */
  async resetPassword(token: string, password: string) {
    // Load the entry from DB with the given token.
    const forgotToken = await this.forgotPasswordRepository.findOne({
      where: { token },
    });
    if (!forgotToken) {
      throw new BadRequestException('Invalid token');
    }

    // Decode token. Throws an error if invalid, return object with user email if valid.
    let emailFromToken: any;
    try {
      emailFromToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new BadRequestException('Invalid token');
    }
    if (emailFromToken.email !== forgotToken.email) {
      throw new BadRequestException('Invalid token');
    }

    const hashedPassword = await bcrypt.hash(password, 8);
    const user = await this.userService.find({ email: forgotToken.email });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.userService.updateUser(user.id, {
      password: hashedPassword,
    });

    return updatedUser;
  }
}
