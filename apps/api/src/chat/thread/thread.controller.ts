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
  async findOne(@CurrentUser() user: User, @Param('id') id: string) {
    const thread = await this.threadService.findThreadWithMessages(+id);
    await this.threadService.setThreadAsRead(thread, user);
    return thread;
  }

  @Get('user/:id')
  async findOneOrCreate(@CurrentUser() user: User, @Param('id') id: string) {
//    this.logger.log("------------------------------------------------------------");
//    this.logger.log(`in Get('user/:id'), user.id = ${user.id}, param id = ${id}`);
    const to = await this.userService.findById(+id);
//    this.logger.log("------------------------------------------------------------");
//    this.logger.log(`in Get('user/:id'), to = ${JSON.stringify(to)}`);
    if (!to) throw new UnprocessableEntityException('This user does not exist');
//    this.logger.log("------------------------------------------------------------");
    const rel = await this.relService.findRel(user, to);
//    this.logger.log(`in Get('user/:id'), rel = ${JSON.stringify(rel)}`);
    if (rel) {
      if (rel.block_received) throw new UnauthorizedException('This user has blocked you');
      if (rel.block_sent) throw new UnauthorizedException('You have blocked this user');
    }
//    this.logger.log("------------------------------------------------------------");
    if (to.id === user.id)
      throw new UnprocessableEntityException("You can't thread with yourself");
    return this.threadService.findOneOrCreate(user, to);
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
