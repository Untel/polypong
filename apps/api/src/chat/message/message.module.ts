/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   message.module.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/08/12 21:55:17 by adda-sil          #+#    #+#             */
/*   Updated: 2022/09/06 18:39:21 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Module, forwardRef } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { Message } from './entities';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThreadModule } from '../thread/thread.module';
import { SocketModule } from 'src/socket/socket.module';
// import { ChannelModule } from '../channel';

@Module({
  // eslint-disable-next-line prettier/prettier
  imports: [
    TypeOrmModule.forFeature([Message]),
    forwardRef(() => SocketModule),
    // forwardRef(() => ChannelModule),
  ],
  controllers: [MessageController],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule {}
