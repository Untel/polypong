/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   thread.service.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/08/12 21:54:53 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/18 21:14:08 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user';
import { Repository } from 'typeorm';
import { Message } from '../message/entities/message.entity';
import { CreateThreadDto } from './dto/create-thread.dto';
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
    const thread = this.threadRep.create(th);
    return thread;
  }

  async newDirectMessage(message: Partial<Message>, from: User, to: User) {
    return;
  }

  findAll(user: User) {
    return this.threadRep.find({
      where: { participants: { user: { id: user.id } } },
      relations: ['participants', 'lastMessage'],
    });
  }

  async findOneOrCreate(users: User[] = []) {
    const th = await this.threadRep.findOne({
      where: {
        participants: users.map((u) => ({ user: { id: u.id } })),
      },
    });
    if (th) return th;

    this.logger.log(
      `Trying to get unexisting thread between ${users
        .map((u) => u.name)
        .join(', ')}. Creating...`,
    );

    const thread = new Thread();
    const participants = users.map(
      (user) => new ThreadParticipant({ user, thread }),
    );
    await this.threadParticipantRep.create(participants);
    thread.participants = participants;
    // const created = await newThread.save();
    const created = this.threadRep.create(thread);
    return created;
  }

  update(id: number, updateThreadDto: UpdateThreadDto) {
    return `This action updates a #${id} thread`;
  }

  remove(id: number) {
    return `This action removes a #${id} thread`;
  }
}
