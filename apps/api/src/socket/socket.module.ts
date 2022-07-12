import { Module } from '@nestjs/common';
import { SocketService } from './socket.service';
import { AuthModule } from 'src/auth';
import { PongModule } from 'src/pong';
import { SocketGateway } from './socket.gateway';
import { SocketController } from './socket.controller';

@Module({
  imports: [PongModule, AuthModule],
  controllers: [SocketController],
  providers: [SocketGateway, SocketService],
  exports: [SocketGateway, SocketService],
})
export class SocketModule {}
