import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
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

  async findAll(user: User) {
    const userMatch = await this.userMatchRep.find({
      where: { user: { id: user.id } },
      order: { createdAt: 'DESC' },
      relations: ['match.players.user'],
    });
    return userMatch.map((um) => um.match);
  }

  async getAllMatches() {
    const allMatches = await this.matchRep.find({
      relations: ['players.user'],
    });
    return allMatches;
  }

  async getAllPlayersUsersIds() {
    const playersUsersIds = await this.userMatchRep
      .createQueryBuilder('')
      .select('user_id')
      .distinct(true)
      .getRawMany();
    return playersUsersIds;
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
