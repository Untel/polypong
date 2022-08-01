import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  Logger,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { TwoFactorAuthenticationCodeDto } from '../dtos/two-factor-authentication-code.dto';
import RequestWithUser from '../interfaces/requestWithUser.interface';
import { AuthService } from '../services/auth.service';
import { TwoFactorAuthenticationService } from '../services/twoFactorAuthentication.service';
import { toDataURL } from 'qrcode';
import JwtSimpleGuard from 'src/guards/jwt-simple.guard';

@Controller('2fa')
@UseInterceptors(ClassSerializerInterceptor)
export class TwoFactorAuthenticationController {
  constructor(
    private readonly twoFactorAuthenticationService: TwoFactorAuthenticationService,
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}
  logger = new Logger(`2fa Controller`);

  @Get('generate')
  @UseGuards(JwtSimpleGuard)
  async register(@Req() req: RequestWithUser, @Res() res) {
    console.log('GET GENERATE');
    // this.logger.log(`generate - req.user = ${JSON.stringify(req.user)}`);
    const { otpauthUrl } =
      await this.twoFactorAuthenticationService.generateTwoFactorAuthenticationSecret(
        req.user,
      );

    this.logger.log(`generate - otpauthUrl = ${otpauthUrl}`);
    const qrAsDataUrl = await new Promise((resolve, reject) => {
      toDataURL(otpauthUrl, [], (error, result) => {
        resolve(result);
        console.log('result resolved', result);
      });
    });
    this.logger.log(`generate - qrAsDataUrl = ${qrAsDataUrl}`);

    res.send({ qrAsDataUrl });
  }

  @Post('activate')
  @HttpCode(200)
  @UseGuards(JwtSimpleGuard)
  async turnOnTwoFactorAuthentication(
    @Req() req: RequestWithUser,
    @Body() { twoFactorAuthenticationCode }: TwoFactorAuthenticationCodeDto,
  ) {
    this.logger.log("@Post('activate')");
    this.logger.log(`code received = ${twoFactorAuthenticationCode}`);
    const isValid =
      this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(
        twoFactorAuthenticationCode,
        req.user,
      );
    this.logger.log(`code validity = ${isValid}`);

    if (isValid) {
      await this.userService.turnOnTwoFactorAuthentication(req.user.id);
    } else {
      throw new UnauthorizedException('2FA activation code invalid, check your google authenticator');
    }
  }

  @Post('authenticate')
  @HttpCode(201)
  @UseGuards(JwtSimpleGuard)
  async authenticate(
    @Req() req,
    @Body() { twoFactorAuthenticationCode }: TwoFactorAuthenticationCodeDto,
    @Res() res,
  ) {
    this.logger.log(`authenticate - req.user : ${JSON.stringify(req.user)}`);
    this.logger.log(`authenticate - 2fa secret : ${TwoFactorAuthenticationCodeDto}`);
    const isValid =
      this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(
        twoFactorAuthenticationCode,
        req.user,
      );
    this.logger.log(`authenticate - isValid = ${isValid}`);
    const user = req.user;
    // create a jwt access token with the property is2fa set to true
    if (isValid) {
      res.send(user);
    } else {
      throw new UnauthorizedException('2FA');
    }
  }
}
