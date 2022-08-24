/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   thread.guard.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/08/09 13:34:13 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/24 07:28:32 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnprocessableEntityException,
  createParamDecorator,
  Inject,
  forwardRef,
  UnauthorizedException,
} from '@nestjs/common';
import { Thread } from 'src/chat/thread/entities/thread.entity';

@Injectable()
export default class ThreadGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const params = req.params;
    const threadId = +params.id;
    const user = req.user;
    console.log('Checking thread auth');
    // const thread = await this.threadService.findThread(threadId, user.id);
    const thread = await Thread.createQueryBuilder('thread')
      .innerJoinAndSelect('thread.participants', 'me', 'me.user_id = :id', {
        id: user.id,
      })
      .leftJoinAndSelect('thread.participants', 'participants')
      .leftJoinAndSelect('participants.user', 'user')
      .getOne();
    // console.log('ALlowED THREAD', thread);
    if (!thread) {
      throw new UnauthorizedException(
        'You are not allowed to access this thread',
      );
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