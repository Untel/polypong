import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { MailModule } from './mail/mail.module';


import { PongModule } from './pong/pong.module';
import { PassportModule } from '@nestjs/passport';

import { RedisModule } from '@liaoliaots/nestjs-redis';

// CONFIGS
import { typeormConfig, passportConfig, redisConfig } from 'src/config';

const asyncConfig = (moduleName) => ({
    useFactory: (configService: ConfigService) => configService.get(moduleName),
    inject:[ConfigService]
});

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [typeormConfig, passportConfig, redisConfig] }),
    RedisModule.forRootAsync(asyncConfig('redis')),
    TypeOrmModule.forRootAsync(asyncConfig('typeorm')),
    PassportModule.registerAsync(asyncConfig('passport')),
    MulterModule.register({
      dest: './avatars',
    }),

    UserModule,
    MailModule,
    AuthModule,
    PongModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor() {}
}
