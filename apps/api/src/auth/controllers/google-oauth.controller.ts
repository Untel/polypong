import {
  Controller,
  Get,
  Req,
  Request,
  UseGuards,
  Res,
  Logger,
  Redirect,
} from '@nestjs/common';
import { GoogleOAuthGuard } from 'src/guards/google-auth.guard';
import RequestWithUser from '../interfaces/requestWithUser.interface';
import { AuthService } from '../services/auth.service';

@Controller('auth/google')
export class GoogleOAuthController {
  constructor(private authService: AuthService) {}
  logger = new Logger();

  @Get()
  @UseGuards(GoogleOAuthGuard)
  async googleAuth(@Req() req) {}

  @Get('callback')
  @UseGuards(GoogleOAuthGuard)
  async googleAuthRedirect(@Request() req: RequestWithUser, @Res() res) {
    this.logger.log(
      `process.env.FRONTEND_URL/dashboard = ${process.env.FRONTEND_URL}/dashboard`,
    );

    const { user } = req;

    const cookie = this.authService.getCookieWithJwtToken(user.id);
    res.setHeader('Set-Cookie', cookie);
    user.password = undefined;

    res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  }
}
