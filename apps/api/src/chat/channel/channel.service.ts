import { Injectable } from '@nestjs/common';
import { User } from 'src/user';
import { Not } from 'typeorm';
import {
  Thread,
  ThreadMemberStatus,
  ThreadParticipant,
  ThreadService,
} from '../thread';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { ChannelMember, ChannelMemberStatus } from './entities';
import { Channel } from './entities/channel.entity';

@Injectable()
export class ChannelService {
  constructor(private readonly threadService: ThreadService) {}
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
    return await channel.save();
  }

  update(id: number, updateChannelDto: UpdateChannelDto) {}

  findAll(user = { id: null }) {
    Channel.find({
      relations: ['thread.participants.user'],
      where: {
        thread: {
          participants: {
            user: {
              id: Not(user.id),
            },
          },
        },
      },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} channel`;
  }

  remove(id: number) {
    return `This action removes a #${id} channel`;
  }
}
