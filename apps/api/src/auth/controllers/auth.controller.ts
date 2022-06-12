import { AuthService } from '../services/auth.service';
import { LoggedInGuard } from 'src/guards/logged-in.guard';
import {
  Body, Controller, Get, HttpCode, Logger, Param, Patch, Post, Req,
  Request,Res,UseGuards, UsePipes, ValidationPipe, Query
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
import JwtRefreshGuard from 'src/guards/jwt-refresh.guard';
import JwtTwoFactorGuard from 'src/guards/jwt-two-factor.guard';
import JwtAuthenticationGuard from 'src/guards/jwt-authentication.guard';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly passwordService: PasswordService,
    private readonly userService: UserService,
  ) {}
  logger = new Logger('AuthController');

  /**
  * Register new user.
  * @param {RegisterUserDto} registerUserDto
  *   The data (name, email, password) of the new user.
  * @returns
  */
  @Post('register')
  @UsePipes(new ValidationPipe({ transform: true }))
  async registerUser(
    @Body() registerUserDto: RegisterUserDto,
    @Req() req,
    @Res() res,
  ) {
    this.logger.log("@Post('register')");
    console.log("registerUserDto", registerUserDto);
    const result = await this.authService.registerUser(registerUserDto);
    if (result.user) {

      // call req.logIn from passport (Done by LocalGuard in .login()) to generate the session
      await new Promise((resolve, reject) => {
        req.login(result.user, (err) => {
          if (err) throw new Error('Sorry, somethin went wrong. We could register but sign you in.');
          resolve(req.session);
        });
      });
      // then call the login controller to set the cookie
      return this.login(req, res);
    }
  }

  /**
  * Log user in
  * @param {Request} req : The request object.
  * @returns User
  */
  @UseGuards(LocalGuard)
  @HttpCode(201)
  @Post('login')
  async login(@Req() req, @Res() res)
  {
    this.logger.log(`@Post(login), req.session = ${JSON.stringify(req.session)}`);
    const user = req.user;
    // const accessCookie = this.authService.getCookieWithJwtToken(user.id);
    const token = this.authService.getToken({ ...user });
    // const cookie = `Authentication=${token}; HttpOnly; Path=/; Max-Age=${process.env.JWT_EXPIRATION}`
    // res.setHeader(
    //   'Set-Cookie', [cookie]
    // );

    // if 2fa is enabled, don't return user info yet
    if (user.isTwoFactorAuthenticationEnabled) {
      return res.send({
        isTwoFactorAuthenticationEnabled: true,
        accessCookie: token,
      });
    }

    this.logger.log(`@Post(login), returning user`);
    return res.send({ ...user, token });
  }

  @Get('verifyToken')
  async verifyToken(@Req() req, @Query('token') token: string) {
    console.log("Provided token before", token);
    console.log("Provided token before", req.query);
    return this.authService.verifyToken(token);
  }

//	@UseGuards(LoggedInGuard)
//	@Get('logout')
//	logout(@Request() req) {
//	  req.session.destroy();
//	  return req.logOut();
//	}
    @UseGuards(JwtTwoFactorGuard)
    @Post('logout')
    async logOut(@Req() req, @Res() res)
  {
    this.logger.log(`@Post(logout)`);
    await this.userService.removeRefreshToken(req.user.id);

    res.setHeader('Set-Cookie', this.authService.getCookieForLogOut());
    return res.sendStatus(200);
    }

  @UseGuards(JwtRefreshGuard)
  @Get('refresh')
  refresh(@Req() request: RequestWithUser) {
    const accessTokenCookie = this.authService.getCookieWithJwtToken(request.user.id);

    request.res.setHeader('Set-Cookie', accessTokenCookie);
    return request.user;
  }

  /**
  * Get data of the current user.
  * @param {Request} req : The request object.
  * @returns
  */
    // @UseGuards(JwtTwoFactorGuard)
	// @UseGuards(new JwtAuthenticationGuard())
	@UseGuards(LoggedInGuard)
  @Get('user')
  async getUser(@Request() req): Promise<any> {
    delete req.user.password;

    // Ici on ajoute le jwt token au payload car on en aura besoin pour authentifier le websocket
    return {
      ...req.user,
      token: this.authService.getToken({ ...req.user }),
    };
  }

  // verify JWT and return user data, so the browser can check the validity
  // of the current jwt and get the data of the currently logged-in user.
  @UseGuards(JwtTwoFactorGuard)
//	@UseGuards(LoggedInGuard)
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
    this.logger.log("auth/email/verify");
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
    this.logger.log(`in email/verify/:token`);
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
  async updatePassword(
    @Request() req,
    @Body() body: UpdatePasswordDto
) {
  return await this.passwordService.changePassword(
    req.user, body.oldPassword, body.newPassword,
  );
}

  /**
  * Send email to user with a reset password link.
  * @param {ForgotPasswordDto} body
  */
  @Post('password/forgotlink')
  async sendForgotPasswordLink(@Body() body: ForgotPasswordDto) {
    this.logger.log("auth/password/forgotlink");
    this.passwordService.sendForgotPasswordLink(body.email);
  }

  /**
  * Reset password of a user.
  * @param {ResetPasswordDto} body : Data about the new password.
  */
  @Post('password/reset')
  @UsePipes(new ValidationPipe({ transform: true }))
  async resetPassword(@Body() body: ResetPasswordDto)
  {
    this.logger.log(`in auth/password/reset, body.token = ${body.token}\n`);
    this.passwordService.resetPassword(
      body.token, body.password
    );
  }

}
