import { Module } from '@nestjs/common';
import { PongController } from './pong.controller';
import { PongService } from './pong.service';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { SocketGateway } from './socket.gateway';

@Module({
  imports: [AuthModule, UserModule],
  controllers: [PongController],
  providers: [PongService, SocketGateway],
})
export class PongModule {}
