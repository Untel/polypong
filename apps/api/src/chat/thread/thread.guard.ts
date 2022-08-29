/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   thread.guard.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/08/09 13:34:13 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/29 22:09:22 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  createParamDecorator,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Thread } from 'src/chat/thread/entities/thread.entity';

import { SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ThreadMemberStatus } from './entities/thread-participant.entity';
import { Request } from 'express';
import RequestWithUser from 'src/auth/interfaces/requestWithUser.interface';

export const ThreadRole = (...roles: ThreadMemberStatus[]) => SetMetadata('roles', roles);

@Injectable()
export default class ThreadGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext) {
    const req: RequestWithUser = context.switchToHttp().getRequest();
    const params = req.params;
    const threadId = +params.id;
    const userId = req.user['id'];
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
    Object.assign(req, { thread });

    const roles = this.reflector.get<ThreadMemberStatus[]>(
      'roles',
      context.getHandler(),
    );

    console.log('ROLES FOUND roles', roles);
    const me = thread.participants.find((e) => e.user.id === req.user.id);
    if (!me) throw new UnprocessableEntityException('something went wrong');
    Object.assign(req, { me });

    if (!roles) return true;
    if (me.status < roles[0])
      throw new UnauthorizedException('You don\t the right to do that');

    if (req.method === 'PUT' && req.body.targetId) {
      const targetId = +req.body.targetId;
      console.log('TARGET ID', targetId);
      if (targetId === userId) {
        throw new UnauthorizedException('You can t do this action on youtself');
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
