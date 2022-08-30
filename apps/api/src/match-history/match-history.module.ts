import { forwardRef, Module } from '@nestjs/common';
import { MatchHistoryService } from './match-history.service';
import { MatchHistoryController } from './match-history.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Match, UserMatch } from './entities';
import { UserModule } from 'src';

@Module({
  providers: [MatchHistoryService],
  // eslint-disable-next-line prettier/prettier
  imports: [
    TypeOrmModule.forFeature([Match, UserMatch]),
    forwardRef(() => UserModule),
  ],
  controllers: [MatchHistoryController],
  exports: [MatchHistoryService],
})
export class MatchHistoryModule {}
