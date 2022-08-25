/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   thread.module.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/08/12 21:55:01 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/22 22:47:36 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Module, forwardRef } from '@nestjs/common';
import { ThreadService } from './thread.service';
import { ThreadController } from './thread.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Thread, ThreadParticipant } from './entities';
import { UserModule } from 'src/user';
import { MessageModule } from '../message';
import { ChannelModule } from '../channel';
import { RelationshipModule } from 'src/relationship';

@Module({
  // eslint-disable-next-line prettier/prettier
  imports: [
    TypeOrmModule.forFeature([Thread, ThreadParticipant]),
    forwardRef(() => UserModule),
    forwardRef(() => RelationshipModule),
    forwardRef(() => MessageModule),
    forwardRef(() => ChannelModule),
  ],
  controllers: [ThreadController],
  providers: [ThreadService],
  exports: [ThreadService],
})
export class ThreadModule {}
