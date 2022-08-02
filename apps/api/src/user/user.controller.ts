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

import {
  Controller,
  Param,
  Logger,
  Body,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Req,
  Put,
  forwardRef,
  Inject,
  UploadedFile,
  UseInterceptors,
  Get,
  Res,
} from '@nestjs/common';
// import * as Express from 'multer';
import JwtGuard from 'src/guards/jwt.guard';
import { UserService } from './user.service';
import { updateUserDto } from './dtos/update-user.dto';
import { AuthService } from 'src/auth';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  logger = new Logger('UserController');

  /**
   * Get data of the current user.
   * @param {Request} req : The request object.
   * @returns
   */
  @UseGuards(JwtGuard)
  @Get('user')
  async getUser(@Req() req): Promise<any> {
    return this.userService.findById(req.user.id);
  }

  /**
   * Update the properties of an user.
   * @param {Request} req : The request object.
   * @param {updateUserDto} updateUserDto : properties to update
   * @returns
   */
  @UseGuards(JwtGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Put(':userId')
  async updateUser(
    @Body() updateUserDto: updateUserDto,
    @Param('userId') userId,
    @Req() req,
  ) {
    this.logger.log(`updateUser - userId = ${userId}`);
    this.logger.log(
      `updateUser - updateUserDto = ${JSON.stringify(updateUserDto)}`,
    );
    this.logger.log(`updateUser - req.user = ${JSON.stringify(req.user)}`);
    const isSelf = userId == req.user.id ? true : false;
    this.logger.log(
      `updateUser - req.user.id = ${req.user.id}, userId = ${userId}, isSelf = ${isSelf}`,
    );
    let updatedUser = null;
    try {
      if (isSelf) {
        updatedUser = await this.userService.updateSelf(
          req.user,
          updateUserDto,
        );
      } else {
        updatedUser = await this.userService.updateOther(
          req.user,
          updateUserDto,
          userId,
        );
      }
    } catch (error) {
      throw error;
    }
    return { user: updatedUser, statusCode: 201 };
    // check properties and redirect to the right controllers ? Or do stuff in the service ?
  }

  /**
   * Set avatar of an user.
   * @param {Request} req : The request object.
   * @param {UpdateAvatarDto} body : new avatar
   * @returns
   */
  @UseGuards(JwtGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post('setAvatar')
  @UseInterceptors(FileInterceptor('avatar', { dest: './avatars' }))
  async setAvatar(@Req() req, @UploadedFile() avatar: Express.Multer.File) {
    this.logger.log(`in setAvatar, user.email : (${req.user.email})`);
    this.logger.log(`in setAvatar, avatar.path = ${avatar.path})`);
    return await this.userService.setAvatar(
      req.user,
      `http://localhost:9999/api/user/${avatar.path}`,
    );
  }

  /**
   * Get avatar of the current user.
   * @param {Request} req : The request object.
   * @returns
   */
  @UsePipes(new ValidationPipe({ transform: true }))
  @Get('avatars/:fileId')
  async serveAvatar(@Param('fileId') fileId, @Res() res) {
    this.logger.log(`in serveAvatar, fileId = ${fileId}`);
    this.logger.log(`in serveAvatar, about to res.sendfile`);
    res.sendfile(fileId, { root: 'avatars' });
  }
}
