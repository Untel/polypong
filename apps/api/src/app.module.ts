/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   app.module.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/08/09 13:33:58 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/15 01:07:25 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

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
  ChatModule,
} from '.';

import { PassportModule } from '@nestjs/passport';

import { RedisModule } from '@liaoliaots/nestjs-redis';
import * as configs from 'src/config';
import { SocketModule } from './socket';
import { RelationshipModule } from './relationship/relationship.module';
import { asyncConfig } from './utils/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [...Object.values(configs)],
    }),
    RedisModule.forRootAsync(asyncConfig('redis')),
    TypeOrmModule.forRootAsync(asyncConfig('typeorm')),
    PassportModule.registerAsync(asyncConfig('passport')),
    UserModule,
    MailModule,
    AuthModule,
    SocketModule,
    PongModule,
    LobbyModule,
    RelationshipModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
