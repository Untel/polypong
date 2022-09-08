/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   thread.guard.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: edal--ce <edal--ce@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/08/09 13:34:13 by adda-sil          #+#    #+#             */
/*   Updated: 2022/09/08 21:43:26 by edal--ce         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  createParamDecorator,
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import moment from 'moment';
import { SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Thread } from 'src/chat/thread/entities/thread.entity';
import {
  ThreadMemberStatus,
  ThreadParticipant,
} from './entities/thread-participant.entity';
import RequestWithUser from 'src/auth/interfaces/requestWithUser.interface';
import { ChannelPrivacy } from '../channel';
import { Message } from '../message';
import bcrypt from 'bcrypt';

export const ThreadRole = (...roles: ThreadMemberStatus[]) =>
  SetMetadata('roles', roles);

@Injectable()
export default class ThreadGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext) {
    const req: RequestWithUser = context.switchToHttp().getRequest();
    const params = req.params;
    const user = req.user;
    const threadId = +params.id;
    const thread = await Thread.createQueryBuilder('thread')
      .withDeleted()
      .where({ id: threadId })
      .leftJoinAndSelect('thread.participants', 'participants')
      .leftJoinAndSelect('thread.channel', 'channel')
      .leftJoinAndSelect('participants.user', 'user')
      .getOne();
    if (!thread) {
      throw new UnauthorizedException('This thread does not exist');
    }
    Object.assign(req, { thread });

    const roles = this.reflector.get<ThreadMemberStatus[]>(
      'roles',
      context.getHandler(),
    );
    let me = thread.participants.find((e) => e.user.id === req.user.id);
    if (!me) {
      const pwd = req.query['password'] as string;
      if (
        thread.channel?.privacy === ChannelPrivacy.PUBLIC ||
        thread.channel?.privacy === ChannelPrivacy.PRIVATE ||
        (thread.channel?.privacy === ChannelPrivacy.PROTECTED &&
          pwd &&
          bcrypt.compareSync(pwd, thread.channel.password))
      ) {
        me = await ThreadParticipant.create({ thread, user }).save();
        await Message.create({
          thread,
          content: `${user.name} joined the channel`,
        }).save();
      } else if (thread.channel?.privacy === ChannelPrivacy.PROTECTED)
        throw new HttpException(
          {
            statusCode: 466,
            error: 'Password required',
            message: 'This channel require a password',
          },
          HttpStatus.FORBIDDEN,
        );
    } else if (me.deletedAt && me.isBanUntil) {
      const m = moment(me.isBanUntil).diff(moment());
      if (m > 0) {
        const dur = moment.duration(m);
        throw new UnauthorizedException(
          `You are bannished from this thread for ${dur.humanize()} remaining`,
        );
      } else {
        await me.remove();
      }
    }
    Object.assign(req, { me });

    if (!roles) return true;
    if (me.status < roles[0])
      throw new UnauthorizedException('You don\t the right to do that');

    if (req.method === 'PUT' && req.body.targetId) {
      const targetId = +req.body.targetId;
      console.log('TARGET ID', targetId);
      if (targetId === user.id) {
        throw new UnauthorizedException('You can t do this action on yourself');
      }
      const target = thread.participants.find((e) => e.user.id === targetId);
      if (target && target.status >= me.status)
        throw new UnauthorizedException(
          'You can t do this action to an administrator',
        );
      Object.assign(req, { target });
    }
    return true;
  }
}

export const CurrentThread = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Thread => {
    const request = ctx.switchToHttp().getRequest();
    return request.thread as Thread;
  },
);
