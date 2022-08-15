/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   auth.controller.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/08/14 00:53:44 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/15 16:21:28 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { AuthService } from '../services/auth.service';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Logger,
  Param,
  Patch,
  Post,
  Req,
  Request,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { LocalGuard } from 'src/guards/local.guard';
import { UserService } from 'src/user/user.service';
import { EmailVerificationDto } from '../dtos/email-verification.dto';
import { ForgotPasswordDto } from '../dtos/forgot-password.dto';
import { RegisterUserDto } from '../dtos/register-user.dto';
import { ResetPasswordDto } from '../dtos/reset-password.dto';
import { UpdatePasswordDto } from '../dtos/update-password.dto';
import { VerifyEmailTokenDto } from '../dtos/verify-email-token.dto';
import { PasswordService } from '../services/password-auth.service';
import RequestWithUser from '../interfaces/requestWithUser.interface';
import JwtTwoFactorGuard from 'src/guards/jwt-two-factor.guard';
import JwtGuard from 'src/guards/jwt.guard';
import { User } from 'src/user';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly passwordService: PasswordService,
    private readonly userService: UserService, // private readonly socketGateway: SocketGateway,
  ) {}
  logger = new Logger('AuthController');

  /**
   * Register new user.
   * @param {RegisterUserDto} registerUserDto
   *   The data (name, email, password) of the new user.
   * @returns
   */
  @Post('register')
  async registerUser(@Body() registerUserDto: RegisterUserDto, @Req() req) {
    const result = await this.authService.registerUser(registerUserDto);
    if (result.user) {
      req.user = result.user;
      return this.login(req);
    }
  }

  /**
   * Log user in
   * @param {Request} req : The request object.
   * @returns User
   */
  @UseGuards(LocalGuard)
  @Post('login')
  login(@Req() req) {
    const user = req.user;
    const token = this.authService.getToken({ id: user.id });

    // if 2fa is enabled, don't return user info yet
    if (user.isTwoFactorAuthenticationEnabled) {
      return {
        isTwoFactorAuthenticationEnabled: true,
        token: token,
      };
    }
    return { token };
  }

  /**
   * Get data of the current user.
   * @param {Request} req : The request object.
   * @returns
   */
  @UseGuards(JwtGuard)
  @Get('user')
  getUser(@Request() req: RequestWithUser): User {
    return req.user;
  }

  // verify JWT and return user data, so the browser can check the validity
  // of the current jwt and get the data of the currently logged-in user.
  @UseGuards(JwtTwoFactorGuard)
  @Get()
  authenticate(@Request() req: RequestWithUser) {
    const user = req.user;
    user.password = undefined;
    return user;
  }

  /**
   * Send email to user with an email confirmation link.
   * @param {EmailVerificationDto} body
   */
  @Post('email/verify')
  async sendEmailVerificationMail(@Body() body: EmailVerificationDto) {
    this.logger.log('auth/email/verify');
    const email = body.email;
    const user = await this.userService.find({ email }, false);
    this.logger.log(`in email/verify, user = ${user}`);
    if (user) {
      this.authService.sendEmailVerificationMail(user);
    }
  }

  /**
   * Verify email address of user.
   * @param {Param} params : a jwt for the purpose of email verification
   * @returns
   */
  @UsePipes(new ValidationPipe({ transform: true }))
  @Get('email/verify/:token')
  async verifyEmail(@Param() params: VerifyEmailTokenDto) {
    this.logger.log('in email/verify/:token');
    return this.authService.verifyEmail(params.token);
  }

  /**
   * Update password of a user.
   * @param {Request} req : The request object.
   * @param {UpdatePasswordDto} body : Information about the new password.
   * @returns
   */
  //   @UseGuards(LoggedInGuard)
  @UseGuards(JwtTwoFactorGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Patch('password/update')
  async updatePassword(@Request() req, @Body() body: UpdatePasswordDto) {
    return await this.passwordService.changePassword(
      req.user,
      body.oldPassword,
      body.newPassword,
    );
  }

  /**
   * Send email to user with a reset password link.
   * @param {ForgotPasswordDto} body
   */
  @Post('password/forgotlink')
  async sendForgotPasswordLink(@Body() body: ForgotPasswordDto) {
    this.logger.log('auth/password/forgotlink');
    this.passwordService.sendForgotPasswordLink(body.email);
  }

  /**
   * Reset password of a user.
   * @param {ResetPasswordDto} body : Data about the new password.
   */
  @Post('password/reset')
  @UsePipes(new ValidationPipe({ transform: true }))
  async resetPassword(@Body() body: ResetPasswordDto) {
    this.logger.log(`in auth/password/reset, body.token = ${body.token}\n`);
    this.passwordService.resetPassword(body.token, body.password);
  }
}
