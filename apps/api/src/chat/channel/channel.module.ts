import { Module } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { ChannelController } from './channel.controller';
import { Channel } from './entities/channel.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  // eslint-disable-next-line prettier/prettier
  imports: [
    TypeOrmModule.forFeature([Channel]),
  ],
  controllers: [ChannelController],
  providers: [ChannelService],
})
export class ChannelModule {}
