import { Injectable } from '@nestjs/common';
import { CreateMatchHistoryDto } from './dto/create-match-history.dto';
import { UpdateMatchHistoryDto } from './dto/update-match-history.dto';

@Injectable()
export class MatchHistoryService {
  create(createMatchHistoryDto: CreateMatchHistoryDto) {
    return 'This action adds a new matchHistory';
  }

  findAll() {
    return `This action returns all matchHistory`;
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
