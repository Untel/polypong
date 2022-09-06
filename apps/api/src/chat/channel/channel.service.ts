import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { User } from 'src/user';
import { IsNull, Not } from 'typeorm';
import { Message } from '../message/entities/message.entity';
import { MessageService } from '../message/message.service';
import {
  Thread,
  ThreadMemberStatus,
  ThreadParticipant,
  ThreadService,
} from '../thread';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { Channel } from './entities/channel.entity';

@Injectable()
export class ChannelService {
  constructor(
    @Inject(forwardRef(() => ThreadService))
    private threadService: ThreadService,
  ) {}

  async create(user: User) {
    const thread = await Thread.create({
      participants: [
        ThreadParticipant.create({ user, status: ThreadMemberStatus.OWNER }),
      ],
    }).save();
    const channel = Channel.create({
      thread,
      initiator: user,
    });
    // await Message.create({
    //   thread,
    //   content: `${user.name} has created this channel`,
    // }).save();
    await this.threadService.createSystemMessage(
      thread,
      `${user.name} has created the channel`,
    );
    return await channel.save();
  }

  update(id: number, updateChannelDto: UpdateChannelDto) {}

  async findAll(user = { id: null }) {
    const chans = await Channel.find({
      relations: ['thread.participants.user'],
    });
    // const chans = await Channel.createQueryBuilder('channel')
    //   .innerJoinAndSelect('channel.thread', 'thread')
    //   .leftJoinAndSelect('thread.participants', 'participants')
    //   .leftJoinAndSelect('participants.user', 'user')
    //   .getMany();

    return chans.map((channel) => ({
      ...channel,
      name: channel.thread.participants.map((p) => p.user.name).join(', '),
    }));
  }

  findOne(id: number) {
    return `This action returns a #${id} channel`;
  }

  remove(id: number) {
    return `This action removes a #${id} channel`;
  }
}
