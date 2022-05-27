import { Injectable, Logger, Res } from "@nestjs/common";
import { authenticator } from "otplib";
import { User } from "src/user/user.entity";
import { UserService } from "src/user/user.service";
import { toFileStream, toDataURL } from 'qrcode';
@Injectable()
export class TwoFactorAuthenticationService {
	constructor(
		private readonly userService: UserService,
	) {}
	logger = new Logger('TwoFactorAuthenticationService');

	public async generateTwoFactorAuthenticationSecret(user: User) {
		const secret = authenticator.generateSecret();
		const otpauthUrl = authenticator.keyuri(
			user.email,
			process.env.TWO_FACTOR_AUTHENTICATION_APP_NAME,
			secret,
		);
		await this.userService.setTwoFactorAuthenticationSecret(
			secret, user.id
		);
		return { secret, otpauthUrl };
	}

	// serve the otpauth url to the user in a QR code
	public async pipeQrCodeStream(
		stream: Response, otpauthUrl: string
	) {
		this.logger.log(`otpauthUrl = ${otpauthUrl}`);
		return toFileStream(stream, otpauthUrl);
	}

	public async sendQrCodeAsDataURL(
		@Res() res, otpauthUrl: string
	) {
		this.logger.log(`in sendQrCodeAsDataURL`);
		const qrAsDataUrl = await new Promise((resolve, reject) => {
			toDataURL(otpauthUrl, [], (error, result) => {
				resolve(result);
			});
		});
		this.logger.log(`qrAsDataURL = ${qrAsDataUrl}`);
		res.send(qrAsDataUrl);
	}

	// check if 2fa code sent by client matches secret in db
	public isTwoFactorAuthenticationCodeValid(
		twoFactorAuthenticationCode: string, user: User
	) {
		return authenticator.verify({
			token: twoFactorAuthenticationCode,
			secret: user.twoFactorAuthenticationSecret,
		});
	}
}