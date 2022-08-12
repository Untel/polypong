import { Module, forwardRef } from '@nestjs/common';
import { PongController } from './pong.controller';
import { PongService } from './pong.service';
import { UserModule } from 'src/user/user.module';
import { LobbyModule } from 'src/lobby';

@Module({
  // eslint-disable-next-line prettier/prettier
  imports: [UserModule, forwardRef(() => LobbyModule)],
  controllers: [PongController],
  providers: [PongService],
  exports: [PongService],
})
export class PongModule {}
