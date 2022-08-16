import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { Equal, Repository } from 'typeorm';
import { CreateMatchHistoryDto } from './dto/create-match-history.dto';
import { UpdateMatchHistoryDto } from './dto/update-match-history.dto';
import { Match } from './entities';
import { UserMatch } from './entities/user-match.entity';

@Injectable()
export class MatchHistoryService {
  constructor(
    @InjectRepository(UserMatch)
    private userMatchRep: Repository<UserMatch>,
    @InjectRepository(Match)
    private matchRep: Repository<Match>,
  ) {}

  create(createMatchHistoryDto: CreateMatchHistoryDto) {
    return 'This action adds a new matchHistory';
  }

  findAll(user: User) {
    console.log('Finding all for', user.id);
    return this.matchRep.find({
      where: { players: { user: { id: user.id } } },
      order: { createdAt: 'DESC' },
      relations: ['players.user'],
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} matchHistory`;
  }

  update(id: number, updateMatchHistoryDto: UpdateMatchHistoryDto) {
    return `This action updates a #${id} matchHistory`;
  }

  remove(id: number) {
    return `This action removes a #${id} matchHistory`;
  }
}
