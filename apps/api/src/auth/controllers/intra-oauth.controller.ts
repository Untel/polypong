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
import { IntraOAuthGuard } from 'src/guards/intra-auth.guard';
import RequestWithUser from '../interfaces/requestWithUser.interface';
import { AuthService } from '../services/auth.service';
import url from 'url';
@Controller('auth/intra')
export class IntraOAuthController {
  constructor(private authService: AuthService) {}

  logger = new Logger('IntraOAuthController');

  @Get()
  @UseGuards(IntraOAuthGuard)
  async intraAuth(@Req() req) {}

  @Get('callback')
  @UseGuards(IntraOAuthGuard)
  async intraAuthRedirect(@Request() req: RequestWithUser, @Res() res) {
    this.logger.log(`@Get() auth/intra/callback`);
    console.log('Auth inner query 2', req.query);
    const user = req.user;
    const token = this.authService.getToken({ ...(user as any) });
    if (user.isTwoFactorAuthenticationEnabled) {
      return res.send({
        isTwoFactorAuthenticationEnabled: true,
        accessCookie: token,
      });
    }

    this.logger.log(`@Post(login), returning user`);
    return res.redirect(
      url.format({
        pathname: '/',
        query: { token },
      }),
    );
  }
}
