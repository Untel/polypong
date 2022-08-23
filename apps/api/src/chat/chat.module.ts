import { Module, forwardRef } from '@nestjs/common';
import { RelationshipModule } from 'src/relationship';
// import { SocketModule } from 'src/socket/socket.module';
import { ChannelModule } from './channel';
import { ThreadModule } from './thread';

@Module({
  // eslint-disable-next-line prettier/prettier
  imports: [
    forwardRef(() => ThreadModule),
    forwardRef(() => ChannelModule),
    // forwardRef(() => SocketModule),
    // RelationshipModule,
  ],
})
export class ChatModule {}
