import { Module } from '@nestjs/common';
import { PongController } from './pong.controller';
import { PongService } from './pong.service';
import { PongGateway } from './pong.gateway';

@Module({
  imports: [],
  controllers: [PongController],
  providers: [PongService, PongGateway],
})
export class PongModule { }
