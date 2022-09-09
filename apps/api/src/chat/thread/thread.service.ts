/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   thread.service.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/08/12 21:54:53 by adda-sil          #+#    #+#             */
/*   Updated: 2022/09/09 05:07:10 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import {
  Global,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ID, TS } from 'src/entities/root.entity';
import { RelationshipService } from 'src/relationship';
import { UserService } from 'src/user';
import { User } from 'src/user/user.entity';
import { Message } from '../message/entities/message.entity';
import { UpdateThreadDto } from './dto/update-thread.dto';
import { Thread, ThreadMemberStatus, ThreadParticipant } from './entities';
import moment from 'moment';

@Injectable()
export class ThreadService {
  constructor(
    private userService: UserService,
    private relService: RelationshipService,
  ) {}

  logger = new Logger('ThreadService');

  async newDirectMessage(message: Partial<Message>, from: User, to: User) {
    return;
  }

  async findAll(user: User) {
    const threads = await Thread.createQueryBuilder('thread')
      .innerJoinAndSelect(
        'thread.participants',
        'me',
        'me.user_id = :id AND (me.isBanUntil IS NULL OR me.isBanUntil < NOW())',
        { id: user.id },
      )
      .leftJoinAndMapMany(
        'thread.unreadMessages',
        'thread.messages',
        'message',
        'message.created_at > me.saw_until', // "me" alias is known
      )
      // .loadRelationCountAndMap(
      //   'thread.unreadCount',
      //   'thread.messages',
      //   'message',
      //   (qb) => qb.andWhere('message.created_at > me.saw_until'), // "me" alias is unknown
      // )
      .leftJoinAndSelect('thread.participants', 'participants')
      .leftJoinAndSelect('participants.user', 'user')
      .leftJoinAndSelect('thread.channel', 'channel')
      .leftJoinAndSelect('channel.initiator', 'initiator')
      // LAST MESSAGE
      .leftJoinAndMapOne(
        'thread.lastMessage',
        'message',
        'lastMessage',
        'lastMessage.id = (SELECT MAX(id) FROM message WHERE thread_id = thread.id)',
      )
      .orderBy('lastMessage.createdAt', 'DESC')
      .leftJoinAndSelect('lastMessage.sender', 'sender')
      .getMany();
    return threads;
  }

  async inviteUser(thread: Thread, user: User) {
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
  }

  async findThreadWithMessages(user: User, id: ID) {
    console.log('user = ', user, 'id = ', id);
    const thread = await Thread.findOne({
      relations: [
        'participants.user',
        'messages.sender.relationships',
        'channel',
      ],
      where: { id },
      order: { messages: { createdAt: 'DESC' } },
    });
    thread.messages.forEach(async (m) => {
      if (m.sender) {
        const other: User = await this.userService.findById(m.sender.id);
        const rel = await this.relService.findRel(user, other);
        if (rel) {
          if (rel.fromId === user.id) {
            if (rel.block_received || rel.block_sent) {
              m.content = 'content cannot be displayed';
            }
          }
        }
      }
    });
    return thread;
  }

  async setThreadAsRead(thread: Thread, user: User) {
    return ThreadParticipant.update(
      {
        thread: { id: thread.id },
        user: { id: user.id },
      },
      { sawUntil: new Date() },
    );
  }

  async findThread(id: ID, userId: ID) {
    return Thread.findOneByOrFail({
      id,
      participants: { user: { id: userId } },
    });
  }

  async findOneOrCreate(user: User, to: User) {
    const key = `th-${[user.id, to.id].sort().join('-')}`;
    const th = await Thread.findOneBy({ key });
    if (th) return th;

    if (user.id === to.id) return this.create([to], { key });
    return this.create([user, to], { key });
  }

  async create(users: User[], datas: Partial<Thread> = {}) {
    const thread = Thread.create({
      participants: users.map((user) => ThreadParticipant.create({ user })),
      ...datas,
    });
    return await thread.save();
  }

  async createSystemMessage(thread: Thread, message: string) {
    return await Message.create({
      thread,
      content: message,
    }).save();
  }

  update(id: number, updateThreadDto: UpdateThreadDto) {
    return `This action updates a #${id} thread`;
  }

  remove(id: number) {
    return `This action removes a #${id} thread`;
  }
}
