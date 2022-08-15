/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   app.module.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/08/09 13:33:58 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/15 14:25:54 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import {
  AuthModule,
  UserModule,
  MailModule,
  PongModule,
  LobbyModule,
  ChatModule,
  MatchHistoryModule,
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
    forwardRef(() => UserModule),
    forwardRef(() => MailModule),
    forwardRef(() => AuthModule),
    forwardRef(() => SocketModule),
    forwardRef(() => PongModule),
    forwardRef(() => LobbyModule),
    forwardRef(() => RelationshipModule),
    forwardRef(() => ChatModule),
    forwardRef(() => MatchHistoryModule),
  ],
})
export class AppModule {}
