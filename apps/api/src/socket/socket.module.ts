/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   socket.module.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/08/03 00:18:39 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/14 00:50:48 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { forwardRef, Global, Module } from '@nestjs/common';
import { SocketService } from './socket.service';
import { AuthModule } from 'src/auth';
import { UserModule } from 'src/user';
import { SocketGateway } from './socket.gateway';
import { SocketController } from './socket.controller';
import { LobbyModule } from 'src/lobby';
@Global()
@Module({
  imports: [
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
    forwardRef(() => LobbyModule),
  ],
  controllers: [SocketController],
  providers: [SocketGateway, SocketService],
  exports: [SocketGateway, SocketService],
})
export class SocketModule {}
