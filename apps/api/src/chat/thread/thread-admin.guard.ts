/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   thread-admin.guard.ts                              :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/08/09 13:34:13 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/28 01:49:09 by adda-sil         ###   ########.fr       */
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
import { ThreadMemberStatus } from './entities';
import { Thread } from './entities/thread.entity';

@Injectable()
export default class ThreadAdminGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const thread: Thread = req.thread;
    const me = thread.participants.find((e) => e.user.id === req.user.id);

    if (!me) throw new UnprocessableEntityException('something went wrong');
    else if (me.status < ThreadMemberStatus.ADMIN)
    throw new UnauthorizedException('Only admins can do that');

    if (req.params.targetId) {
      const target = thread.participants.find((e) => e.user.id === (+req.params.targetId));
      if (target && target.status >= me.status)
        throw new UnauthorizedException('You can t do this action to an administrator');
      req.target = target;
    }
    return true;
  }
}
