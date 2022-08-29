/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   thread.service.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/08/12 21:54:53 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/27 23:47:00 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ID, TS } from 'src/entities/root.entity';
import { User } from 'src/user/user.entity';
import { In, IsNull, Repository } from 'typeorm';
import { Message } from '../message/entities/message.entity';
import { UpdateThreadDto } from './dto/update-thread.dto';
import { Thread, ThreadParticipant } from './entities';

@Injectable()
export class ThreadService {
  logger = new Logger('ThreadService');

  constructor(
    @InjectRepository(Thread)
    private threadRep: Repository<Thread>,
    @InjectRepository(ThreadParticipant)
    private threadParticipantRep: Repository<ThreadParticipant>,
  ) {}

  async newDirectMessage(message: Partial<Message>, from: User, to: User) {
    return;
  }

  async findAll(user: User) {
    const threads = await Thread.createQueryBuilder('thread')
      .innerJoinAndSelect('thread.participants', 'me', 'me.user_id = :id', {
        id: user.id,
      })
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
      .leftJoinAndSelect('sender.user', 'sender_user')
      .getMany();
    return threads;
  }

  async findThreadWithMessages(id: ID) {
    return Thread.findOne({
      where: { id },
      // eslint-disable-next-line prettier/prettier
      relations: ['participants.user', 'messages.sender.user', 'channel'],
      order: { messages: { createdAt: 'DESC' } },
    });
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

    return this.create([user, to], { key });
  }

  async create(users: User[], datas: Partial<Thread> = {}) {
    const thread = Thread.create({
      participants: users.map((user) => ThreadParticipant.create({ user })),
      ...datas,
    });
    return await thread.save();
  }

  update(id: number, updateThreadDto: UpdateThreadDto) {
    return `This action updates a #${id} thread`;
  }

  remove(id: number) {
    return `This action removes a #${id} thread`;
  }
}
