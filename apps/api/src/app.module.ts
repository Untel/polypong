import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PongGateway } from './pong/pong.gateway';
import { PongService } from './pong/pong.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, PongGateway, PongService],
})
export class AppModule { }
