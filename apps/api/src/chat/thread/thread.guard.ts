/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   thread.guard.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/08/09 13:34:13 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/28 04:29:35 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  createParamDecorator,
  UnauthorizedException,
} from '@nestjs/common';
import { Thread } from 'src/chat/thread/entities/thread.entity';
import { ThreadMemberStatus } from './entities/thread-participant.entity';

@Injectable()
export default class ThreadGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const params = req.params;
    const threadId = +params.id;
    const userId = req.user.id;
    console.log('Checking thread auth');
    // const thread = await this.threadService.findThread(threadId, user.id);
    const thread = await Thread.createQueryBuilder('thread')
      .innerJoinAndSelect(
        'thread.participants',
        'me',
        'me.user_id = :userId AND me.thread_id = :threadId',
        {
          userId,
          threadId,
        },
      )
      .leftJoinAndSelect('thread.participants', 'participants')
      .leftJoinAndSelect('thread.channel', 'channel')
      .leftJoinAndSelect('participants.user', 'user')
      .getOne();
    if (!thread) {
      throw new UnauthorizedException(
        'You are not allowed to access this thread',
      );
    }
    const meInThread = thread.participants.find((p) => p.user.id === userId);
    if (meInThread.status === ThreadMemberStatus.INVITED) {
      meInThread.status = ThreadMemberStatus.MEMBER;
      meInThread.joinedAt = new Date();
      const saved = await meInThread.save();
      req.meInThread = saved;
    }
    req.thread = thread;
    return true;
  }
}

export const CurrentThread = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.thread;
  },
);
