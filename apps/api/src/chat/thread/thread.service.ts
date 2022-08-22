/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   thread.service.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/08/12 21:54:53 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/22 22:46:18 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ID, TS } from 'src/entities';
import { User } from 'src/user';
import { In, Repository } from 'typeorm';
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
    const threads = await Thread.find({
      where: { participants: { user: { id: user.id } } },
      relations: [
        'participants.user',
        'lastMessage.sender.user',
        'channel.initiator.user',
      ],
      order: { lastMessage: { createdAt: TS.ASC } },
    });

    console.log('Threads', threads);
    const mapped = threads.map((t) => {
      console.log('T is', t);
      const recipient = t.channel
        ? t.channel.initiator.user
        : t.participants.find((p) => p.user.id !== user.id).user;
      return {
        ...t,
        recipient,
      };
    });
    console.log('Mapped', mapped);
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
