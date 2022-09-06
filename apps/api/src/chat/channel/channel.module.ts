import { forwardRef, Module } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { ChannelController } from './channel.controller';
import { Channel } from './entities/channel.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThreadModule } from '../thread/thread.module';
import { MessageModule } from '../message/message.module';

@Module({
  // eslint-disable-next-line prettier/prettier
  imports: [
    TypeOrmModule.forFeature([Channel]),
    forwardRef(() => ThreadModule),
    forwardRef(() => MessageModule),
  ],
  controllers: [ChannelController],
  providers: [ChannelService],
})
export class ChannelModule {}
