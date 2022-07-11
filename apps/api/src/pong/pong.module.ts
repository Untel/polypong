import { Module } from '@nestjs/common';
import { PongController } from './pong.controller';
import { PongService } from './pong.service';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { LobbyModule } from 'src/lobby';

@Module({
  imports: [UserModule],
  controllers: [PongController],
  providers: [PongService],
  exports: [PongService],
})
export class PongModule {}
