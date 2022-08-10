import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AppController } from './app.controller';
import {
  AppService,
  AuthModule,
  UserModule,
  MailModule,
  PongModule,
  LobbyModule,
} from '.';

import { PassportModule } from '@nestjs/passport';

import { RedisModule } from '@liaoliaots/nestjs-redis';

import * as configs from 'src/config';
import { SocketModule } from './socket';
import { RelationshipModule } from './relationship/relationship.module';
const asyncConfig = (moduleName) => ({
  useFactory: (configService: ConfigService) => configService.get(moduleName),
  inject: [ConfigService],
});

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [...Object.values(configs)],
    }),
    RedisModule.forRootAsync(asyncConfig('redis')),
    TypeOrmModule.forRootAsync(asyncConfig('typeorm')),
    PassportModule.registerAsync(asyncConfig('passport')),
    MulterModule.register({
      dest: './avatars',
    }),
    UserModule,
    MailModule,
    AuthModule,
    SocketModule,
    PongModule,
    LobbyModule,
    RelationshipModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
