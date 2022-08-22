/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   message.module.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/08/12 21:55:17 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/22 23:02:24 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Module, forwardRef } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { Message } from './entities';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThreadModule } from '../thread/thread.module';
import { SocketModule } from 'src/socket';

@Module({
  // eslint-disable-next-line prettier/prettier
  imports: [
    // forwardRef(() => SocketModule),
    TypeOrmModule.forFeature([Message]),
  ],
  controllers: [MessageController],
  providers: [MessageService],
})
export class MessageModule {}
