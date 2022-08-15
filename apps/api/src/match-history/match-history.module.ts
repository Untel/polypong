import { forwardRef, Module } from '@nestjs/common';
import { MatchHistoryService } from './match-history.service';
import { MatchHistoryController } from './match-history.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Match, UserMatch } from './entities';

@Module({
  // eslint-disable-next-line prettier/prettier
  imports: [
    TypeOrmModule.forFeature([Match, UserMatch]),
  ],
  controllers: [MatchHistoryController],
  providers: [MatchHistoryService],
  exports: [MatchHistoryService],
})
export class MatchHistoryModule {}
