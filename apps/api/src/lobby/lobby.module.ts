import { Module, forwardRef, Global } from '@nestjs/common';
import { LobbiesController } from './lobbies.controller';
import { LobbyController } from './lobby.controller';
import { LobbyService } from './lobby.service';
// import { LobbyGateway } from './lobby.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { PongModule } from 'src/pong/pong.module';
import { SocketModule } from 'src/socket/socket.module';
import LobbyExistGuard from './guards/lobby-exist.guard';
@Module({
  // eslint-disable-next-line prettier/prettier
  imports: [
    forwardRef(() => SocketModule),
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
  ],
  controllers: [LobbiesController, LobbyController],
  providers: [LobbyService],
  exports: [LobbyService],
})
export class LobbyModule {}
