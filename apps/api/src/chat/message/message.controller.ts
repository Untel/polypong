import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import JwtGuard from 'src/guards/jwt.guard';
import ThreadGuard, { CurrentThread } from '../thread/thread.guard';
import { CurrentUser } from 'src/decorators';
import { Thread, ThreadParticipant } from '../thread';
import { User } from 'src/user';
import { TS } from 'src/entities';
import moment from 'moment';

@UseGuards(JwtGuard, ThreadGuard)
@Controller('thread/:id/message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  create(
    @CurrentThread() thread: Thread,
    @CurrentUser() user: User,
    @Body() createMessageDto: CreateMessageDto,
    @Req() req,
  ) {
    const me: ThreadParticipant = req.me;
    if (me.isMuteUntil) {
      const m = moment(me.isMuteUntil).diff(moment(), 'seconds');
      const dur = moment.duration(m, 'seconds');
      throw new UnauthorizedException(
        `You are muted for ${dur.humanize()} remaining`,
      );
    }
    return this.messageService.create(thread, user, createMessageDto);
  }

  @Get()
  findAll() {
    return this.messageService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.messageService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMessageDto: UpdateMessageDto) {
    return this.messageService.update(+id, updateMessageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.messageService.remove(+id);
  }
}
