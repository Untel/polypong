import { Body, ClassSerializerInterceptor, Controller, Get, HttpCode, Logger, Post, Req, Res, UnauthorizedException, UseGuards, UseInterceptors } from '@nestjs/common';
import JwtAuthenticationGuard from 'src/guards/jwt-authentication.guard';
import { UserService } from 'src/user/user.service';
import { TwoFactorAuthenticationCodeDto } from '../dtos/two-factor-authentication-code.dto';
import RequestWithUser from '../interfaces/requestWithUser.interface';
import { AuthService } from '../services/auth.service';
import { TwoFactorAuthenticationService } from '../services/twoFactorAuthentication.service';

@Controller('2fa')
@UseInterceptors(ClassSerializerInterceptor)
export class TwoFactorAuthenticationController{
	constructor(
		private readonly twoFactorAuthenticationService: TwoFactorAuthenticationService,
		private readonly userService: UserService,
		private readonly authService: AuthService,
	) {}
	logger = new Logger(`2fa Controller`);

	@Get('generate')
	@UseGuards(JwtAuthenticationGuard)
	async register(@Res() res, @Req() req: RequestWithUser) {
		const { user } = req;
		const { otpauthUrl } = await 
			this.twoFactorAuthenticationService
				.generateTwoFactorAuthenticationSecret(user);

		this.twoFactorAuthenticationService.sendQrCodeAsDataURL(
			res, otpauthUrl,
		);
//		return this.twoFactorAuthenticationService.pipeQrCodeStream(
//			res, otpauthUrl
//		);
	}

	@Post('activate')
	@HttpCode(200)
	@UseGuards(JwtAuthenticationGuard)
	async turnOnTwoFactorAuthentication(
		@Req() req: RequestWithUser,
		@Body() { twoFactorAuthenticationCode } : TwoFactorAuthenticationCodeDto
	) {
		this.logger.log("@Post('activate')");
		this.logger.log(`code received = ${twoFactorAuthenticationCode}`);
		const isValid = this.twoFactorAuthenticationService
			.isTwoFactorAuthenticationCodeValid(
				twoFactorAuthenticationCode, req.user
			);
		
		if (isValid) {
			this.logger.log(`code valid ? ${isValid}`);
			await this.userService.turnOnTwoFactorAuthentication(
				req.user.id
			);
		} else {
			throw new UnauthorizedException('2fa code not valid');
		}
	}

	@Post('authenticate')
	@HttpCode(201)
	@UseGuards(JwtAuthenticationGuard)
	async authenticate(
		@Req() req,
		@Body() { twoFactorAuthenticationCode } : TwoFactorAuthenticationCodeDto,
		@Res() res,
	) {
		this.logger.log("@Post('authenticate')");
		const isValid = this.twoFactorAuthenticationService
			.isTwoFactorAuthenticationCodeValid(
				twoFactorAuthenticationCode, req.user
			);
		this.logger.log(`@Post('authenticate') - isValid = ${isValid}`);
		const user = req.user
		// create a jwt access token with the property is2fa set to true
		if (isValid) {
			this.logger.log(`about to set cookie`);
			const accessTokenCookie =
				this.authService.getCookieWithJwtToken(req.user.id, true);
			res.setHeader('Set-Cookie', [accessTokenCookie]);
			this.logger.log(`cookie set.`);
			res.send(user);
		} else {
			throw new UnauthorizedException('2fa code not valid');
		}
	}
}
