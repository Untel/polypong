/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Param,
  Delete,
  UnprocessableEntityException,
  UseGuards,
  Logger,
  UnauthorizedException,
  Put,
  Req,
} from '@nestjs/common';
import { ThreadService } from './thread.service';
import { User } from 'src/user/user.entity';
import { CurrentUser } from 'src/decorators/user.decorator';
import { UserService } from 'src/user';
import JwtGuard from 'src/guards/jwt.guard';
import ThreadGuard, { CurrentThread, ThreadRole } from './thread.guard';
import { RelationshipService } from 'src/relationship';
import { ID } from 'src/entities';
import { Thread, ThreadMemberStatus, ThreadParticipant } from './entities';
import { Message, MessageService } from '../message';
import { SocketService } from 'src/socket/socket.service';
import moment from 'moment';

@UseGuards(JwtGuard)
@Controller('thread')
export class ThreadController {
  constructor(
    private readonly threadService: ThreadService,
    private readonly userService: UserService, // private readonly channelService: ChannelService,
    private readonly relService: RelationshipService,
    private readonly messageService: MessageService,
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
  @ThreadRole(ThreadMemberStatus.ADMIN)
  @UseGuards(ThreadGuard)
  async invite(
    @CurrentUser() inviter: User,
    @CurrentThread() thread: Thread,
    @Param('userId') userId: ID,
  ) {
    const user = await this.userService.findById(+userId);
    if (!user)
      throw new UnprocessableEntityException('This user does not exist');

    const me = thread.participants.find((e) => e.user.id === user.id);
    if (me && me.deletedAt && me.isBanUntil) {
      const m = moment(me.isBanUntil).diff(moment());
      if (m > 0) {
        const dur = moment.duration(m);
        throw new UnauthorizedException(
          `User is bannished from this thread for ${dur.humanize()} remaining`,
        );
      } else {
        await me.remove();
      }
    }

    const tp = ThreadParticipant.create({
      user,
      thread,
      status: ThreadMemberStatus.MEMBER,
    });
    await ThreadParticipant.insert(tp);
    this.messageService.sendSystemMessage(
      thread,
      `${user.name} was invited by ${inviter.name}`,
    );
  }

  @Put(':id/kick')
  @ThreadRole(ThreadMemberStatus.ADMIN)
  @UseGuards(ThreadGuard)
  async kick(@CurrentUser() user: User, @CurrentThread() thread, @Req() req) {
    const target: ThreadParticipant = req.target;
    await target.remove();
    this.messageService.sendSystemMessage(
      thread,
      `${target.user.name} was kicked by ${user.name}`,
    );
  }

  @Put(':id/ban')
  @ThreadRole(ThreadMemberStatus.ADMIN)
  @UseGuards(ThreadGuard)
  async ban(@CurrentUser() user: User, @CurrentThread() thread, @Req() req) {
    const target: ThreadParticipant = req.target;
    if (!target)
      throw new UnprocessableEntityException('This user is not in this thread');
    const duration = +req.body.duration;
    const endDate = !duration
      ? moment(8.64e15)
      : moment().add(duration, 'minutes');
    target.isBanUntil = endDate.toDate();
    await target.save();
    await target.softRemove();
    this.messageService.sendSystemMessage(
      thread,
      `${target.user.name} was kicked by ${user.name}`,
    );
  }

  @Put(':id/promote')
  @ThreadRole(ThreadMemberStatus.OWNER)
  @UseGuards(ThreadGuard)
  async promote(
    @CurrentUser() user: User,
    @CurrentThread() thread,
    @Req() req,
  ) {
    const target: ThreadParticipant = req.target;
    if (!target)
      throw new UnprocessableEntityException('This user is not in this thread');
    target.status = ThreadMemberStatus.ADMIN;
    await target.save();
    this.messageService.sendSystemMessage(
      thread,
      `${target.user.name} was promoted to admin by ${user.name}`,
    );
  }

  @Put(':id/mute')
  @ThreadRole(ThreadMemberStatus.ADMIN)
  @UseGuards(ThreadGuard)
  async mute(@CurrentUser() user: User, @CurrentThread() thread, @Req() req) {
    const target: ThreadParticipant = req.target;
    if (!target)
      throw new UnprocessableEntityException('This user is not in this thread');
    const duration = +req.body.duration;
    const endDate = !duration
      ? moment(8.64e15)
      : moment().add(duration, 'minutes');
    target.isMuteUntil = endDate.toDate();
    await target.save();
    this.messageService.sendSystemMessage(
      thread,
      `${target.user.name} was mute for ${
        !duration ? 'ever' : moment.duration(duration, 'minutes').humanize()
      } by ${user.name}`,
    );
  }

  @Put(':id/demote')
  @ThreadRole(ThreadMemberStatus.OWNER)
  @UseGuards(ThreadGuard)
  async demote(@CurrentUser() user: User, @CurrentThread() thread, @Req() req) {
    const target: ThreadParticipant = req.target;
    target.status = ThreadMemberStatus.MEMBER;
    await target.save();
    this.messageService.sendSystemMessage(
      thread,
      `${target.user.name} was demoted to member by ${user.name}`,
    );
  }

  @Delete(':id')
  @UseGuards(ThreadGuard)
  async leave(@CurrentUser() user: User, @CurrentThread() thread: Thread) {
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
        return await thread.remove();
      }
    }
    this.logger.log(`Thread ${thread.id} => ${me.user.name} left`);
    const leaveMessage = await Message.create({
      thread,
      content: `${me.user.name} left`,
    }).save();
    await me.remove();
    await this.messageService.notifyThread(thread, leaveMessage);
  }
}
