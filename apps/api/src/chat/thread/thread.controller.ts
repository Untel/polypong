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
  Logger,
} from '@nestjs/common';
import { ThreadService } from './thread.service';
import { CreateThreadDto } from './dto/create-thread.dto';
import { UpdateThreadDto } from './dto/update-thread.dto';
import { ChannelService } from '../channel/channel.service';
import { User } from 'src/user/user.entity';
import { CurrentUser } from 'src/decorators/user.decorator';
import { UserService } from 'src/user';
import JwtGuard from 'src/guards/jwt.guard';
import ThreadGuard from './thread.guard';

@UseGuards(JwtGuard)
@Controller('thread')
export class ThreadController {
  constructor(
    private readonly threadService: ThreadService,
    private readonly userService: UserService, // private readonly channelService: ChannelService,
  ) {}

  logger = new Logger('ThreadController');

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.threadService.findAll(user);
  }

  @Get(':id')
  @UseGuards(ThreadGuard)
  async findOne(@CurrentUser() user: User, @Param('id') id: string) {
    const thread = await this.threadService.findThreadWithMessages(+id);
    await this.threadService.setThreadAsRead(thread, user);
    return thread;
  }

  @Get('user/:id')
  async findOneOrCreate(@CurrentUser() user: User, @Param('id') id: string) {
    this.logger.log(`in Get('user/:id'), id = ${id}`);
    const to = await this.userService.findById(+id);
    this.logger.log(`in Get('user/:id'), found to = `, to);

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
