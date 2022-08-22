import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UnauthorizedException,
  UnprocessableEntityException,
  UseGuards,
} from '@nestjs/common';
import { ThreadService } from './thread.service';
import { CreateThreadDto } from './dto/create-thread.dto';
import { UpdateThreadDto } from './dto/update-thread.dto';
import { ChannelService } from '../channel/channel.service';
import { User } from 'src/user/user.entity';
import { CurrentUser } from 'src/decorators/user.decorator';
import { UserService } from 'src/user';
import JwtGuard from 'src/guards/jwt.guard';

@UseGuards(JwtGuard)
@Controller('thread')
export class ThreadController {
  constructor(
    private readonly threadService: ThreadService,
    private readonly userService: UserService, // private readonly channelService: ChannelService,
  ) {}

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.threadService.findAll(user);
  }

  @Get(':id')
  async findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.threadService.findThreadWithMessages(+id);
  }

  @Get('user/:id')
  async findOneOrCreate(@CurrentUser() user: User, @Param('id') id: string) {
    const to = await this.userService.findById(+id);
    if (!to) throw new UnprocessableEntityException('This user does not exist');
    if (to.id === user.id)
      throw new UnprocessableEntityException("You can't thread with yourself");
    return this.threadService.findOneOrCreate([user, to]);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateThreadDto: UpdateThreadDto) {
    return this.threadService.update(+id, updateThreadDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.threadService.remove(+id);
  }
}
