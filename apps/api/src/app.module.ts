import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { MailModule } from './mail/mail.module';

import typeormConfig from 'src/config/typeorm.config';
import passportConfig from 'src/config/passport.config';

import { PongModule } from './pong/pong.module';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [typeormConfig, passportConfig]
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => configService.get('typeorm'),
      inject: [ConfigService],
    }),
    PassportModule.registerAsync({
      useFactory: (config: ConfigService) => config.get('passport'),
      inject: [ConfigService],
    }),
    UserModule,
    MailModule,
    AuthModule,
    PongModule,
    MulterModule.register({
      dest: './avatars',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor() {}
}
