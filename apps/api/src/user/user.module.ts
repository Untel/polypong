/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   user.module.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/08/14 00:53:22 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/15 14:10:58 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ForgotPasswordToken } from '../auth/entities/forgot-password-token.entity';
import { User } from './user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AuthModule } from 'src/auth';
import { MulterModule } from '@nestjs/platform-express';
import { asyncConfig } from 'src/utils';
// import { MatchHistoryModule } from 'match-history/match-history.module';

@Module({
  providers: [UserService],
  exports: [UserService],
  imports: [
    TypeOrmModule.forFeature([User, ForgotPasswordToken]),
    MulterModule.registerAsync(asyncConfig('multer')),
    forwardRef(() => AuthModule),
    // forwardRef(() => MatchHistoryModule),
  ],
  controllers: [UserController],
})
export class UserModule {}
