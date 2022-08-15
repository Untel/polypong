import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { MatchHistoryService } from './match-history.service';
import { CreateMatchHistoryDto } from './dto/create-match-history.dto';
import { UpdateMatchHistoryDto } from './dto/update-match-history.dto';
import JwtGuard from 'src/guards/jwt.guard';
import { CurrentUser } from 'src/decorators';
import { User } from 'src/user/user.entity';

@UseGuards(JwtGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('match-history')
export class MatchHistoryController {
  constructor(private readonly matchHistoryService: MatchHistoryService) {}

  @Post()
  create(@Body() createMatchHistoryDto: CreateMatchHistoryDto) {
    return this.matchHistoryService.create(createMatchHistoryDto);
  }

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.matchHistoryService.findAll(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.matchHistoryService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMatchHistoryDto: UpdateMatchHistoryDto,
  ) {
    return this.matchHistoryService.update(+id, updateMatchHistoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.matchHistoryService.remove(+id);
  }
}
