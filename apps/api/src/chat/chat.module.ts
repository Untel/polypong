import { Module } from '@nestjs/common';
import { RelationshipModule } from 'src/relationship';
import { ChannelModule } from './channel';
import { ThreadModule } from './thread';

@Module({
  // eslint-disable-next-line prettier/prettier
  imports: [
    ThreadModule,
    ChannelModule,
    // RelationshipModule,
  ],
})
export class ChatModule {}
