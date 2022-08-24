/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   thread.service.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/08/12 21:54:53 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/24 06:14:26 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ID, TS } from 'src/entities';
import { User } from 'src/user';
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

  async create(th: Partial<Thread>) {
    const thread = Thread.create(th);
    return thread;
  }

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
      .leftJoinAndSelect('initiator.user', 'initiator_user')
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

    // console.log('Threads', threads);
    const mapped = threads.map((t) => {
      // console.log('T is', t);
      const recipient = t.channel
        ? t.channel.initiator.user
        : t.participants.find((p) => p.user.id !== user.id).user;
      const me = t.participants.find((p) => p.user.id === user.id);
      return {
        ...t,
        recipient,
        me,
      };
    });
    // console.log('Mapped', mapped);
    return mapped;
  }

  async findThreadWithMessages(id: ID) {
    return Thread.findOne({
      where: { id },
      // eslint-disable-next-line prettier/prettier
      relations: [
        'participants.user',
        'messages.sender.user',
        'channel',
      ],
      order: { messages: { createdAt: 'DESC' } },
    });
  }

  async findThread(id: ID, userId: ID) {
    return Thread.findOneByOrFail({
      id,
      participants: { user: { id: userId } },
    });
  }

  async findOneOrCreate(users: User[] = []) {
    const th = await this.threadRep.findOne({
      // join: { alias: 'p', leftJoin: {  }},
      where: {
        // participants: users.map((u) => ({ user: { id: u.id } })),
        participants: { user: { id: In(users.map((u) => u.id)) } },
        channel: IsNull(),
      },
      relations: ['participants.user', 'messages'],
    });
    if (th) return th;

    this.logger.log(
      `Trying to get unexisting thread between ${users
        .map((u) => u.name)
        .join(', ')}. Creating...`,
    );

    const thread = new Thread();
    // console.log('thread', thread);
    const participants = users.map((user) => new ThreadParticipant({ user }));
    thread.participants = participants;
    return await thread.save();
  }

  update(id: number, updateThreadDto: UpdateThreadDto) {
    return `This action updates a #${id} thread`;
  }

  remove(id: number) {
    return `This action removes a #${id} thread`;
  }
}
