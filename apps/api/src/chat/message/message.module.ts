/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   message.module.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/08/12 21:55:17 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/14 23:14:57 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { Message } from './entities';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  // eslint-disable-next-line prettier/prettier
  imports: [TypeOrmModule.forFeature([Message])],
  controllers: [MessageController],
  providers: [MessageService],
})
export class MessageModule {}
