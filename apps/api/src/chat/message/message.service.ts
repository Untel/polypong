/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   message.service.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/08/12 21:55:09 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/23 16:29:48 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SocketService } from 'src/socket/socket.service';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { Thread } from '../thread';
// import { Thread } from '../thread/entities/thread.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Message } from './entities';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private messageRep: Repository<Message>,
    @Inject(forwardRef(() => SocketService))
    private socketService: SocketService,
  ) {}

  async create(thread: Thread, user: User, createMessageDto: CreateMessageDto) {
    const message = new Message();
    message.content = createMessageDto.content;
    message.thread = thread;
    message.sender = thread.participants.find((p) => p.user.id === user.id);
    const savedMessage = await message.save();

    // thread.lastMessage = savedMessage;
    // await thread.save();
    thread.participants.forEach((p) => {
      this.socketService
        .getUserSocket(p.user.id)
        .emit('thread-message', thread, savedMessage);
    });
    return savedMessage;
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
