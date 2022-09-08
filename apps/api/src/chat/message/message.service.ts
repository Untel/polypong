/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   message.service.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: edal--ce <edal--ce@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/08/12 21:55:09 by adda-sil          #+#    #+#             */
/*   Updated: 2022/09/08 22:58:26 by edal--ce         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ID } from 'src/entities';
import { SocketService } from 'src/socket/socket.service';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { Thread, ThreadParticipant } from '../thread';
// import { Thread } from '../thread/entities/thread.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Message } from './entities';

@Injectable()
export class MessageService {
  constructor(
    @Inject(forwardRef(() => SocketService))
    private socketService: SocketService,
  ) {}

  async create(thread: Thread, user: User, createMessageDto: CreateMessageDto) {
    const message = new Message();
    message.content = createMessageDto.content;
    message.thread = thread;
    const participant = thread.participants.find((p) => p.user.id === user.id);
    message.sender = participant.user;
    const savedMessage = await message.save();

    participant.sawUntil = new Date();
    await message.sender.save();
    this.notifyThread(thread.id, savedMessage);
    return savedMessage;
  }

  async sendSystemMessage(thread: Thread, content: string) {
    const message = Message.create({
      thread,
      content,
    });
    const savedMessage = await message.save();
    this.notifyThread(thread.id, savedMessage);
    return savedMessage;
  }

  async notifyThread(threadId: ID, message: Message) {
    const participants = await ThreadParticipant.createQueryBuilder('th')
      .where('thread_id = :id', { id: threadId })
      .leftJoinAndSelect('th.user', 'user')
      .getMany();
    participants.forEach((p) => {
      const sock = this.socketService.getUserSocket(p.user.id);
      if (sock) {
        sock.forEach((s)=> s.emit('thread-message', threadId, message));
      }
    });
    return message;
  }

  findAll() {
    return `This action returns all message`;
  }

  findOne(id: number) {
    return `This action returns a #${id} message`;
  }

  update(id: number, updateMessageDto: UpdateMessageDto) {
    return `This action updates a #${id} message`;
  }

  remove(id: number) {
    return `This action removes a #${id} message`;
  }
}
