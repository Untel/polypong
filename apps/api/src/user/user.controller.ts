/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   socket.controller.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/13 02:59:56 by adda-sil          #+#    #+#             */
/*   Updated: 2022/07/09 19:45:57 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Controller, Get, Delete, Param, Logger, Body, Post, UseGuards, UsePipes, ValidationPipe, Req, Res, Put, forwardRef, Inject } from '@nestjs/common';
import JwtGuard from 'src/guards/jwt.guard';
import { UserService } from './user.service';
import { updateUserDto } from './dtos/update-user.dto';
import { AuthService } from 'src/auth';
import { inspect } from 'util';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  logger = new Logger('UserController');

  /**
   * Change name of an user.
   * @param {Request} req : The request object.
   * @param {changeNameDto} body : new nickname
   * @returns
   */
  @UseGuards(JwtGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Put('updateUser/:userId')
  async updateUser(
    @Body() updateUserDto: updateUserDto,
    @Param('userId') userId,
    @Req() req,
  ) {
    this.logger.log(`updateUser - userId = ${userId}`);
    this.logger.log(`updateUser - updateUserDto = ${JSON.stringify(updateUserDto)}`);
    this.logger.log(`updateUser - req.user = ${JSON.stringify(req.user)}`);
    const isSelf = userId == req.user.id ? true : false;
    this.logger.log(`updateUser - req.user.id = ${req.user.id}, userId = ${userId}, isSelf = ${isSelf}`);
    let res;
    try {
      if (isSelf) {
        res = await this.userService.updateSelf(req.user, updateUserDto);
      } else {
        res = await this.userService.updateOther(req.user, updateUserDto, userId);
      }
    } catch (error) {
      this.logger.log(`updateUser - caught error = ${JSON.stringify(error)}`);
      this.logger.log(`updateUser - rethrowing error`);
      throw error;
    }
    this.logger.log(`updateUser - ret = ${JSON.stringify(res)}`);
    return res;
    // check properties and redirect to the right controllers ? Or do stuff in the service ?
  }
}
