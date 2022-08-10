import { Module } from '@nestjs/common';
import { LobbiesController } from './lobbies.controller';
import { LobbyController } from './lobby.controller';
import { LobbyService } from './lobby.service';
// import { LobbyGateway } from './lobby.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { PongModule } from 'src/pong';
import { SocketModule } from 'src/socket';

@Module({
  imports: [AuthModule, UserModule, PongModule, SocketModule],
  controllers: [LobbiesController, LobbyController],
  providers: [LobbyService],
  exports: [LobbyService],
})
export class LobbyModule {}
