import {
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';
import * as RedisStore from 'connect-redis';
import * as session from 'express-session';
import * as passport from 'passport';

import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PassportModule } from '@nestjs/passport';

import * as strategies from 'src/auth/strategies';

import { AuthController } from './controllers/auth.controller';
import { UserModule } from 'src/user/user.module';
import { MailModule } from 'src/mail/mail.module';
import { ForgotPasswordToken } from './entities/forgot-password-token.entity';
import { AuthSerializer } from 'src/providers/serialization.provider';
import { AuthService } from './services/auth.service';
import { GoogleOAuthController } from './controllers/google-oauth.controller';
import { OAuthService } from './services/oauth.service';
import { IntraOAuthController } from './controllers/intra-oauth.controller';
import { PasswordService } from './services/password-auth.service';
import { TwoFactorAuthenticationController } from './controllers/two-factor-authentication.controller';
import { TwoFactorAuthenticationService } from './services/twoFactorAuthentication.service';
import { ConfigService } from '@nestjs/config';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';

@Module({
  providers: [
    AuthService,
    OAuthService,
    TwoFactorAuthenticationService,
    JwtStrategy,
    AuthSerializer,
    PasswordService,
    ...Object.values(strategies),
  ],
  imports: [
    UserModule,
    MailModule,
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => config.get('jwt'),
      inject: [ConfigService],
    }),
    PassportModule.registerAsync({
      useFactory: (config: ConfigService) => config.get('passport'),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([ForgotPasswordToken]),
  ],
  exports: [AuthService, PasswordService, JwtStrategy],
  controllers: [
    AuthController,
    GoogleOAuthController,
    IntraOAuthController,
    TwoFactorAuthenticationController,
  ],
})
export class AuthModule implements NestModule {
  constructor(
    @InjectRedis() private readonly client: Redis,
    private readonly configService: ConfigService,
  ) {}
  configure(consumer: MiddlewareConsumer) {
    const store = new (RedisStore(session))({
      client: this.client,
      logErrors: true,
    });
    const passportConfig = this.configService.get('passport');
    consumer
      .apply(
        session({
          store,
          ...passportConfig,
        }),
        passport.initialize(),
        passport.session(),
      )
      .forRoutes('*');
  }
}
