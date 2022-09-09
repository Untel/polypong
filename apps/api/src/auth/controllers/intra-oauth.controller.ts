/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   intra-oauth.controller.ts                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: edal--ce <edal--ce@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/08/01 19:27:38 by adda-sil          #+#    #+#             */
/*   Updated: 2022/09/09 03:25:31 by edal--ce         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

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
  intraAuth(@Req() req) {
    return true;
  }

  @Get('callback')
  @UseGuards(IntraOAuthGuard)
  async intraAuthRedirect(@Request() req: RequestWithUser, @Res() res) {
    this.logger.log('callback');
    this.logger.log(`callback - Auth inner query 2 - req.query = ${req.query}`);

    const user = req.user;
    this.logger.log(`callback - req.user = ${JSON.stringify(req.user)}`);
    const token = this.authService.getToken({
      id: user.id,
      is2fa: false, // means this token is not 2fa
    });

    this.logger.log(
      `callback - redirecting to front '/' with token ${token} in query url`,
    );
    return res.redirect(
      url.format({
        pathname: '/',
        query: { token },
      }),
    );
  }
}
