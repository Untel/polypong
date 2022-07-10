import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth';
import { PongModule } from 'src/pong';
import { SocketGateway } from './socket.gateway';

@Module({
  imports: [PongModule, AuthModule],
  controllers: [],
  providers: [SocketGateway],
  exports: [],
})
export class SocketModule {}
