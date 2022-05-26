import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { UserModule } from 'src/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailModule } from 'src/mail/mail.module';
import { JwtModule } from '@nestjs/jwt';
import { ForgotPasswordToken } from './entities/forgot-password-token.entity';
import { PassportModule } from '@nestjs/passport';
import { AuthSerializer } from 'src/providers/serialization.provider';
import { AuthService } from './services/auth.service';
import { LocalStrategy } from './strategies/local.strategy';
import { GoogleOAuthController } from './controllers/google-oauth.controller';
import { GoogleStrategy } from './strategies/google.strategy';
import { OAuthService } from './services/oauth.service';
import { IntraStrategy } from './strategies/intra.strategy';
import { IntraOAuthController } from './controllers/intra-oauth.controller';
import { PasswordService } from './services/password-auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TwoFactorAuthenticationController } from './controllers/two-factor-authentication.controller';
import { TwoFactorAuthenticationService } from './services/twoFactorAuthentication.service';
import { JwtTwoFactorStrategy } from './strategies/jwt-two-factor.strategy';

@Module({
  providers: [
    AuthService, OAuthService, TwoFactorAuthenticationService,
    LocalStrategy, JwtStrategy, GoogleStrategy, IntraStrategy,
    JwtTwoFactorStrategy, AuthSerializer, PasswordService,
  ],
  imports: [
    UserModule,
    PassportModule.register({
      session: true,
    }),
    MailModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRATION},
    }),
    TypeOrmModule.forFeature([ForgotPasswordToken]),
  ],
  exports: [
    AuthService, PasswordService,
  ],
  controllers: [
    AuthController, GoogleOAuthController, IntraOAuthController,
    TwoFactorAuthenticationController,
  ],
})
export class AuthModule {}
