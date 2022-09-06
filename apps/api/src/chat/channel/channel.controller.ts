import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from 'src/decorators';
import JwtGuard from 'src/guards/jwt.guard';
import { User } from 'src/user';
import { ChannelService } from './channel.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';

@UseGuards(JwtGuard)
@Controller('channel')
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  @Post()
  create(@CurrentUser() user: User) {
    return this.channelService.create(user);
  }

  @Get()
  async findAll(@CurrentUser() user: User) {
    const chans = await this.channelService.findAll(user);
    const mapped = chans
      .map((channel) => ({
        ...channel,
        name: channel.thread.participants.map((p) => p.user.name).join(', '),
        joined: !!channel.thread.participants.find(
          (p) => p.user.id === user.id,
        ),
      }))
      .sort((a, b) => +a.joined - +b.joined);
    return mapped;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.channelService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChannelDto: UpdateChannelDto) {
    return this.channelService.update(+id, updateChannelDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.channelService.remove(+id);
  }
}
