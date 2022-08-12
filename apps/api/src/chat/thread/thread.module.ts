/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   thread.module.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/08/12 21:55:01 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/12 21:55:01 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Module } from '@nestjs/common';
import { ThreadService } from './thread.service';
import { ThreadController } from './thread.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Thread } from './entities';

@Module({
  // eslint-disable-next-line prettier/prettier
  imports: [TypeOrmModule.forFeature([Thread])],
  controllers: [ThreadController],
  providers: [ThreadService],
})
export class ThreadModule {}
