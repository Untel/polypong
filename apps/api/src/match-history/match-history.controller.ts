import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { MatchHistoryService } from './match-history.service';
import { CreateMatchHistoryDto } from './dto/create-match-history.dto';
import { UpdateMatchHistoryDto } from './dto/update-match-history.dto';
import JwtGuard from 'src/guards/jwt.guard';
import { CurrentUser } from 'src/decorators';
import { User } from 'src/user/user.entity';
import { Match, UserMatch } from './entities';
import { UserService } from 'src';

@UseGuards(JwtGuard)
@Controller('match-history')
export class MatchHistoryController {
  constructor(
    private readonly matchHistoryService: MatchHistoryService,
    private readonly userService: UserService,
  ) {}

  @Post()
  create(@Body() createMatchHistoryDto: CreateMatchHistoryDto) {
    return this.matchHistoryService.create(createMatchHistoryDto);
  }

  @Get()
  async findAll(@CurrentUser() user: User): Promise<UserMatch[] | Match[]> {
    const matchs = await this.matchHistoryService.findAll(user);
    return matchs;
  }

  // fetch the match history of a given user
  @Get('user/:userId')
  async findAllUserMatches(
    @Param('userId') userId: number,
  ): Promise<UserMatch[] | Match[]> {
    const user = await this.userService.findById(userId);
    if (user) {
      return await this.matchHistoryService.findAll(user);
    }
    return null;
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
