/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UnprocessableEntityException,
  UseGuards,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ThreadService } from './thread.service';
import { UpdateThreadDto } from './dto/update-thread.dto';
import { User } from 'src/user/user.entity';
import { CurrentUser } from 'src/decorators/user.decorator';
import { UserService } from 'src/user';
import JwtGuard from 'src/guards/jwt.guard';
import ThreadGuard from './thread.guard';
import { RelationshipService } from 'src/relationship';
import { ID } from 'src/entities';

@UseGuards(JwtGuard)
@Controller('thread')
export class ThreadController {
  constructor(
    private readonly threadService: ThreadService,
    private readonly userService: UserService, // private readonly channelService: ChannelService,
    private readonly relService: RelationshipService,
  ) {}

  logger = new Logger('ThreadController');

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.threadService.findAll(user);
  }

  @Get(':id')
  @UseGuards(ThreadGuard)
  async findOne(@CurrentUser() user: User, @Param('id') id: ID) {
    const thread = await this.threadService.findThreadWithMessages(+id);
    await this.threadService.setThreadAsRead(thread, user);
    return thread;
  }

  @Get('user/:id')
  async findOneOrCreate(@CurrentUser() user: User, @Param('id') id: string) {
    const to = await this.userService.findById(+id);
    if (!to) throw new UnprocessableEntityException('This user does not exist');
    const rel = await this.relService.findRel(user, to);
    if (rel) {
      if (rel.block_received) throw new UnauthorizedException('This user has blocked you');
      if (rel.block_sent) throw new UnauthorizedException('You have blocked this user');
    }
    if (to.id === user.id)
      throw new UnprocessableEntityException("You can't thread with yourself");
    return this.threadService.findOneOrCreate(user, to);
  }
}
