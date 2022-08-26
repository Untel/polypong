import { Injectable } from '@nestjs/common';
import { User } from 'src/user';
import { ThreadService } from '../thread';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { ChannelMember, ChannelMemberStatus } from './entities';
import { Channel } from './entities/channel.entity';

@Injectable()
export class ChannelService {
  constructor(private readonly threadService: ThreadService) {}
  async create(user: User) {
    const thread = await this.threadService.create([user]);
    const channel = Channel.create({
      thread,
      initiator: user,
      members:[
        ChannelMember.create({
          user,
          status: ChannelMemberStatus.OWNER,
        })
      ],
    });
    return await channel.save();
  }

  update(id: number,  updateChannelDto: UpdateChannelDto) {
  }

  findAll() {
    return `This action returns all channel`;
  }

  findOne(id: number) {
    return `This action returns a #${id} channel`;
  }


  remove(id: number) {
    return `This action removes a #${id} channel`;
  }
}
