import { Controller, Get, Req, Request, UseGuards, Res, Logger, Redirect } from '@nestjs/common';
import { IntraOAuthGuard } from 'src/guards/intra-auth.guard';
import RequestWithUser from '../interfaces/requestWithUser.interface';
import { AuthService } from '../services/auth.service';

@Controller('auth/intra')
export class IntraOAuthController {
  constructor(
    private authService: AuthService,
  ) {}

  logger = new Logger('IntraOAuthController');

  @Get()
  @UseGuards(IntraOAuthGuard)
  async intraAuth(@Req() req) {
	  this.logger.log(`@Get() auth/intra`);
  }

  @Get('callback')
  @UseGuards(IntraOAuthGuard)
  async intraAuthRedirect(
    @Request() req: RequestWithUser, @Res() res
  ) {
	  this.logger.log(`@Get() auth/intra/callback`);
    const { user } = req;
	  console.log("Gotten user is", user);
		const accessCookie = this.authService.getCookieWithJwtToken(user.id);
		res.setHeader('Set-Cookie', accessCookie);
		user.password = undefined;
    res.redirect(`/`);
  }
}
