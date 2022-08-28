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
  UploadedFile,
  UseInterceptors,
  Get,
  Res,
} from '@nestjs/common';
// import * as Express from 'multer';
import JwtGuard from 'src/guards/jwt.guard';
import { UserService } from './user.service';
import { updateUserDto } from './dtos/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from 'src/decorators/user.decorator';
import { User } from './user.entity';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  logger = new Logger('UserController');

  /**
   * Get data of the current user.
   * @param {Request} req : The request object.
   * @returns
   */
  @UseGuards(JwtGuard)
  @Get('user')
  async getUser(@CurrentUser() user): Promise<User> {
    return user;
  }

  @UseGuards(JwtGuard)
  @Get('search/:term')
  async search(@Param('term') term: string): Promise<User[]> {
    return this.userService.search(term);
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
    const isSelf = userId == req.user.id ? true : false;
    let updatedUser = null;
    if (isSelf) {
      updatedUser = await this.userService.updateSelf(req.user, updateUserDto);
    } else {
      updatedUser = await this.userService.updateOther(
        req.user,
        updateUserDto,
        userId,
      );
    }
    return { user: updatedUser, statusCode: 201 };
  }

  /**
   * Set avatar of an user.
   * @param {Request} req : The request object.
   * @param {UpdateAvatarDto} body : new avatar
   * @returns
   */
  @UseGuards(JwtGuard)
  @Post('setAvatar')
  @UseInterceptors(FileInterceptor('avatar'))
  async setAvatar(@Req() req, @UploadedFile() avatar: Express.Multer.File) {
    return await this.userService.setAvatar(
      req.user,
      `/api/user/avatar/${avatar.filename}`,
    );
  }

  /**
   * Get avatar of the current user.
   * @param {Request} req : The request object.
   * @returns
   */
  @Get('avatar/:fileId')
  async serveAvatar(@Param('fileId') fileId, @Res() res) {
    res.sendfile(fileId, { root: 'uploads/avatar' });
  }
}
