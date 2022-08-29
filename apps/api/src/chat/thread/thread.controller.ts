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
  Post,
  Put,
  Req,
} from '@nestjs/common';
import { ThreadService } from './thread.service';
import { UpdateThreadDto } from './dto/update-thread.dto';
import { User } from 'src/user/user.entity';
import { CurrentUser } from 'src/decorators/user.decorator';
import { UserService } from 'src/user';
import JwtGuard from 'src/guards/jwt.guard';
import ThreadGuard, { CurrentThread } from './thread.guard';
import ThreadAdminGuard from './thread-admin.guard';
import { RelationshipService } from 'src/relationship';
import { ID } from 'src/entities';
import { Thread, ThreadMemberStatus, ThreadParticipant } from './entities';
import { Message, MessageService } from '../message';
import { SocketService } from 'src/socket/socket.service';

@UseGuards(JwtGuard)
@Controller('thread')
export class ThreadController {
  constructor(
    private readonly threadService: ThreadService,
    private readonly userService: UserService, // private readonly channelService: ChannelService,
    private readonly relService: RelationshipService,
    private readonly messageService: MessageService,
    private readonly socketService: SocketService,
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
      if (rel.block_received)
        throw new UnauthorizedException('This user has blocked you');
      if (rel.block_sent)
        throw new UnauthorizedException('You have blocked this user');
    }
    if (to.id === user.id)
      throw new UnprocessableEntityException("You can't thread with yourself");
    return this.threadService.findOneOrCreate(user, to);
  }

  @Get(':id/invite/:userId')
  @UseGuards(ThreadGuard, ThreadAdminGuard)
  async invite(@CurrentThread() thread: Thread, @Param('userId') userId: ID) {
    const user = await this.userService.findById(+userId);
    if (!user)
      throw new UnprocessableEntityException('This user does not exist');
    await ThreadParticipant.create({
      user,
      thread,
      status: ThreadMemberStatus.MEMBER,
    }).save();
    this.socketService.getUserSocket(user.id)?.emit('thread-invite', thread);
  }

  @Get(':id/kick/:targetId')
  @UseGuards(ThreadGuard, ThreadAdminGuard)
  async kick(@CurrentUser() user: User, @CurrentThread() thread, @Req() req) {
    const target: ThreadParticipant = req.target;
    await target.softRemove();
  }

  @Delete(':id')
  @UseGuards(ThreadGuard)
  async leave(
    @CurrentUser() user: User,
    @CurrentThread() thread: Thread,
    @Req() req,
  ) {
    const me = thread.participants.find((p) => p.user.id === user.id);
    // Si l'owner leave, on transfert le status d'owner
    if (me.status === ThreadMemberStatus.OWNER) {
      // Les participants sont auto sort by status, donc les admins seront eligible en premier
      const others = thread.participants.filter((p) => p.user.id !== user.id);
      if (others[0]) {
        others[0].status = ThreadMemberStatus.OWNER;
        const content = `${me.user.name} gave the ownership to ${others[0].user.name}`;
        this.logger.log(`Thread ${thread.id} => ${content}`);
        await Message.create({
          thread,
          content,
        }).save();
        await others[0].save();
      } else {
        // Si personne n'est eligible, on ferme le thread
        this.logger.log(`Thread ${thread.id} => Closing thread`);
        return await thread.softRemove();
      }
    }
    this.logger.log(`Thread ${thread.id} => ${me.user.name} left`);
    const leaveMessage = await Message.create({
      thread,
      content: `${me.user.name} left`,
    }).save();
    await me.softRemove();
    await this.messageService.notifyThread(thread, leaveMessage);
  }
}
