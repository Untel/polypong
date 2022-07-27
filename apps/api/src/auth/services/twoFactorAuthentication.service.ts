import { Injectable, Logger, Res } from '@nestjs/common';
import { authenticator } from 'otplib';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { toFileStream, toDataURL } from 'qrcode';

@Injectable()
export class TwoFactorAuthenticationService {
  constructor(private readonly userService: UserService) {}
  logger = new Logger('TwoFactorAuthenticationService');

  public async generateTwoFactorAuthenticationSecret(user: any) {
    this.logger.log(`generateTwoFactorAuthenticationSecret - user = ${JSON.stringify(user)}`);
    const secret = authenticator.generateSecret();
    this.logger.log(`generateTwoFactorAuthenticationSecret - secret = ${secret}`);
    const otpauthUrl = authenticator.keyuri(
      user.email,
      process.env.TWO_FACTOR_AUTHENTICATION_APP_NAME,
      secret,
    );
    this.logger.log(`generateTwoFactorAuthenticationSecret - otpauthUrl = ${otpauthUrl}`);
    await this.userService.setTwoFactorAuthenticationSecret(secret, user.id);
    this.logger.log(`generateTwoFactorAuthenticationSecret - after = setTwoFactorAuthenticationSecret`);
    return { secret, otpauthUrl };
  }

  // serve the otpauth url to the user in a QR code
  public async pipeQrCodeStream(stream: Response, otpauthUrl: string) {
    this.logger.log(`pipeQrCodeStream - otpauthUrl = ${otpauthUrl}`);
    return toFileStream(stream, otpauthUrl);
  }

  public async qrCodeAsDataURL(otpauthUrl: string) {
    this.logger.log(`qrCodeAsDataURL`);
    const qrAsDataUrl = await new Promise((resolve, reject) => {
      toDataURL(otpauthUrl, [], (error, result) => {
        resolve(result);
      });
    });
    this.logger.log(`qrCodeAsDataURL - qrAsDataURL = ${qrAsDataUrl}`);
    return qrAsDataUrl;
  }

  // check if 2fa code sent by client matches secret in db
  public isTwoFactorAuthenticationCodeValid(
    twoFactorAuthenticationCode: string,
    user: User,
  ) {
    this.logger.log(`isTwoFactorAuthenticationCodeValid`);
    return authenticator.verify({
      token: twoFactorAuthenticationCode,
      secret: user.twoFactorAuthenticationSecret,
    });
  }
}
