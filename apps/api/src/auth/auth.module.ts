
import { Inject, Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import * as RedisStore from 'connect-redis';
import * as session from 'express-session';
// import { session as passportSession, initialize as passportInitialize } from 'passport';
import * as passport from 'passport';

import { REDIS, RedisModule } from 'src/redis';

import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PassportModule } from '@nestjs/passport';


import { AuthController } from './controllers/auth.controller';
import { UserModule } from 'src/user/user.module';
import { MailModule } from 'src/mail/mail.module';
import { ForgotPasswordToken } from './entities/forgot-password-token.entity';
import { AuthSerializer } from 'src/providers/serialization.provider';
import { AuthService } from './services/auth.service';
import { LocalStrategy } from './strategies/local.strategy';
import { GoogleOAuthController } from './controllers/google-oauth.controller';
import { GoogleStrategy } from './strategies/google.strategy';
import { OAuthService } from './services/oauth.service';
import { IntraStrategy } from './strategies/intra.strategy';
import { IntraOAuthController } from './controllers/intra-oauth.controller';
import { PasswordService } from './services/password-auth.service';
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
    RedisModule,
    UserModule,
    PassportModule.register({
      session: true,
    }),
    MailModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRATION },
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
export class AuthModule implements NestModule {
  constructor(@Inject(REDIS) private readonly redis: any) {}
  configure(consumer: MiddlewareConsumer) {
    // console.log("Redis store", this.redis);
    const store = new (RedisStore(session))({ client: this.redis, logErrors: true });
    console.log("Store?", store);
    consumer
      .apply(
        session({
          store,
          secret: 'sup3rs3cr3t',
          saveUninitialized: true,
          resave: true,
          cookie: {
            sameSite: false,
            httpOnly: true,
            maxAge: 60000,
          },
        }),
        passport.initialize(),
        passport.session(),
      )
      .forRoutes('*');
  }
}
