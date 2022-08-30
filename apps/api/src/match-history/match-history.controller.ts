import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Inject,
  forwardRef,
  Logger,
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
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  logger = new Logger('match-history');

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
    this.logger.log(`in user/${userId}, got user =`, user);
    if (user) {
      return await this.matchHistoryService.findAll(user);
    }
    return null;
  }

  @Get('all')
  async getAllMatches(): Promise<UserMatch[] | Match[]> {
    return await this.matchHistoryService.getAllMatches();
  }

  @Get('playersUsersIds')
  async getAllPlayersUsersIds(): Promise<number[]> {
    return await this.matchHistoryService.getAllPlayersUsersIds();
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
