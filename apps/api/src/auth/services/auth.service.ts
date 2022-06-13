import {
  BadRequestException,
  ConflictException,
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/user.entity';
import * as jwt from 'jsonwebtoken';
import { MailService } from 'src/mail/mail.service';
import { RegisterUserDto } from '../dtos/register-user.dto';
import TokenPayload from '../interfaces/tokenPayload.interface';
import { authenticator } from 'otplib';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  logger = new Logger('AuthService');

  verifyToken(token: string) {
    const secret = this.configService.get('JWT_SECRET');
    return jwt.verify(token, secret);
  }

  async decodeTokenFromCookie(cookie: string) {
    const reg = /(?<=Authentication=)[^;]*/gi; // REGEX MADE BY ANDY OLALA
    const token = reg.exec(cookie)[0];
    const decoded: any = await this.verifyToken(token);
    return decoded;
  }

  async registerUser(creds: RegisterUserDto) {
    this.logger.log('registerUser');
    if (await this.userService.find({ email: creds.email }))
      throw new ConflictException(`Email ${creds.email} is already taken`);
    if (await this.userService.find({ name: creds.name }))
      throw new ConflictException(`Name ${creds.name} is already taken`);
    const hashedPassword = await bcrypt.hash(creds.password, 8);
    try {
      const res = await this.userService.createUser({
        ...creds,
        password: hashedPassword,
      });
      this.sendEmailVerificationMail(res);
      return { user: res };
    } catch (error) {
      console.log();
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Check user by credentials.
   * @param {string} email : The email of the user.
   * @param {string} password : The plain password of the user
   * @returns Promise<User> | null : The user object.
   */
  async validateUser(email: string, password: string): Promise<User> | null {
    // Find the user by email from database and also load the password.
    const user = await this.userService.find({ email }, true);
    if (!user) {
      this.logger.log(`userService.find({${email}}) returned false`);
      throw new UnauthorizedException('Email or password incorrect.');
    }
    this.logger.log(`in validateUser, user.name = ${user.name}`);

    // Accounts that are registered via oAuth should not be accessible via local signin.
    if (user.socialChannel) {
      this.logger.log(
        `accounts registered with oauth are not accessible via local login`,
      );
      throw new UnauthorizedException('Email or password incorrect.');
    }

    this.logger.log(`in validateUser, checking password`);
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    this.logger.log(
      `in validateUser, isPasswordCorrect = ${isPasswordCorrect}`,
    );
    if (!isPasswordCorrect) {
      this.logger.log(
        `in validateUser, password incorrect. Throwing Unauthorized exception`,
      );
      throw new UnauthorizedException('Email or password incorrect.');
    }

    // Remove the password again and send it to client.
    delete user.password;
    return user;
  }

  /**
   * Send a verification email to an user.
   * @param {User} user
   *   The user whom we want to confirm the email address of
   */
  sendEmailVerificationMail(user: User): void {
    // Create a session JWT that holds the users' email
    // as payload and expires in 14 days.
    const token = jwt.sign({ ...user }, process.env.JWT_SECRET, {
      expiresIn: 60 * 60 * 24 * 14,
    });

    // the email confirmation url the user can click on
    const url = `${process.env.FRONTEND_URL}/verifyemail/token=${token}`;

    // Use the mailService to send the mail.
    this.mailService.sendUserConfirmation(user, 'BlaBla', url);
  }

  /**
   * Verify the email address of a user.
   * @param {string} token : email validation token.
   * @returns
   */
  async verifyEmail(token: string): Promise<any> {
    // Validate token. Will throw error if it's not valid.
    let userFromTokenPayload: any;
    try {
      userFromTokenPayload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new BadRequestException('Invalid token');
    }

    // Update email verification status.
    const updatedUser = await this.userService.updateUser(
      userFromTokenPayload.id,
      { email_verified: true },
    );
    this.logger.log(
      `returning updatedUser, name ${updatedUser.name}, email_verified ${updatedUser.email_verified}`,
    );

    return updatedUser;
  }

  public getToken(payload: TokenPayload) {
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRATION + 's',
    });
  }

  // The is2fa property distinguishes bewteen tokens created with
  // or without two-factor authentication
  public getCookieWithJwtToken(userId: number, is2fa: boolean = false) {
    const payload: TokenPayload = { userId, is2fa };
    const token = this.getToken(payload);
    this.logger.log('Auth Token is ' + token);
    return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${process.env.JWT_EXPIRATION}`;
  }

  public getCookieWithJwtRefreshToken(userId: number, is2fa: boolean = false) {
    const payload: TokenPayload = { userId };
    const token = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRATION + 's',
    });
    const cookie = `Refresh=${token}; HttpOnly; Path=/; Max-Age=${process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME}`;
    return { cookie, token };
  }

  // Since jwt are stateless, we can't just make a token invalid.
  // So in order to log an user out, we just remove the token from
  // the browser.
  public getCookieForLogOut() {
    return [
      'Authentication=; HttpOnly; Path=/; Max-Age=0',
      'Refresh=; HttpOnly; Path=/; Max-Age=0',
    ];
  }

  // Check that a client's 2FA QR code matches the secret in the db
  public isTwoFactorAuthenticationCodeValid(
    twoFactorAuthenticationCode: string,
    user: User,
  ) {
    return authenticator.verify({
      token: twoFactorAuthenticationCode,
      secret: user.twoFactorAuthenticationSecret,
    });
  }

  public async findUserByAccessToken(token: string) {
    const payload: TokenPayload = this.jwtService.verify(token, {
      secret: process.env.JWT_SECRET,
    });
    this.logger.log(
      `findUserByAccessToken - payload.userId = ${payload.userId}`,
    );
    if (payload.userId) {
      return this.userService.findById(payload.userId);
    }
  }
}
