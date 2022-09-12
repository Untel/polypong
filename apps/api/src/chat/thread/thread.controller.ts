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
  Patch,
  Body,
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
import moment from 'moment';
import { ChannelPrivacy } from '../channel';
import bcrypt from 'bcrypt';

@UseGuards(JwtGuard)
@Controller('thread')
export class ThreadController {
  constructor(
    private readonly threadService: ThreadService,
    private readonly userService: UserService,
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
    this.logger.log('user = ');
    console.log(user);
    const thread = await this.threadService.findThreadWithMessages(user, +id);
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

    this.threadService.inviteUser(thread, user);

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
    let message = `${target.user.name} was `;
    if (duration === -1) message += 'unban';
    else
      (message += `ban for ${
        !duration ? 'ever' : moment.duration(duration, 'minutes').humanize()
      }`),
        (message += ` by ${user.name}`);
    this.messageService.sendSystemMessage(thread, message);
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
    let message = `${target.user.name} was `;
    if (duration === -1) message += 'unmuted';
    else
      (message += `mute for ${
        !duration ? 'ever' : moment.duration(duration, 'minutes').humanize()
      }`),
        (message += ` by ${user.name}`);
    this.messageService.sendSystemMessage(thread, message);
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
      const others = thread.participants
        .filter((p) => p.user.id !== user.id)
        .sort((a, b) => b.status - a.status);
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
        if (thread.channel) await thread.channel.remove();
        return await thread.remove();
      }
    }
    this.logger.log(`Thread ${thread.id} => ${me.user.name} left`);
    const leaveMessage = await Message.create({
      thread,
      content: `${me.user.name} left`,
    }).save();
    await me.remove();
    await this.messageService.notifyThread(thread.id, leaveMessage);
  }

  @ThreadRole(ThreadMemberStatus.OWNER)
  @UseGuards(ThreadGuard)
  @Patch(':id/channel')
  async update(
    @CurrentThread() thread,
    @CurrentUser() user,
    @Body()
    body: {
      privacy: ChannelPrivacy;
      name: string;
      password: string;
    },
  ) {
    if (!thread.channel) throw new UnauthorizedException('Its not a channel');
    const changed = [];
    if (body.name && thread.channel.name !== body.name) {
      thread.channel.name = body.name;
      changed.push('name');
    }
    if (body.privacy && thread.channel.privacy !== body.privacy) {
      thread.channel.privacy = body.privacy;
      changed.push('privacy');
    }
    if (body.privacy === ChannelPrivacy.PROTECTED) {
      if (!body.password || body.password.length < 3)
        throw new UnprocessableEntityException('Password too short');
      const pwd = bcrypt.hashSync(body.password, 4);
      thread.channel.password = pwd;
      changed.push('password');
    }

    if (changed.length) {
      const saved = await thread.channel.save();
      this.messageService.sendSystemMessage(
        thread,
        `
        ${user.name} have change the settings ${changed.join(
          ', ',
        )} of the channel
      `,
      );
      return saved;
    }
    return;
  }
}
