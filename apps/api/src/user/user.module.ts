/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   user.module.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/08/14 00:53:22 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/15 14:25:15 by adda-sil         ###   ########.fr       */
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

@Module({
  providers: [UserService],
  exports: [UserService],
  imports: [
    TypeOrmModule.forFeature([User, ForgotPasswordToken]),
    MulterModule.registerAsync(asyncConfig('multer')),
    forwardRef(() => AuthModule),
  ],
  controllers: [UserController],
})
export class UserModule {}
