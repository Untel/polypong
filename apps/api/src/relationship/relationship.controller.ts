import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import JwtGuard from 'src/guards/jwt.guard';
import { UserService } from 'src/user';
import { AddRelationByIdDto } from './dtos/add-relation-by-id.dto';
import { AddRelationDto } from './dtos/add-relation.dto';
import { SendFriendRequestDto } from './dtos/send-friend-request.dto';
import { RelationshipService } from './relationship.service';

@Controller('relationship')
export class RelationshipController {
  constructor(
    private readonly relService: RelationshipService,
    private readonly userService: UserService,
  ) {}

  logger = new Logger('RelationshipController');

  // fetch the relationships of the current user
  @UseGuards(JwtGuard)
  @Get('rels')
  async fetchRels(@Req() req) {
    this.logger.log(`In fetchRels, req.user.name = ${req.user.name}`);
    return await this.relService.fetchRels(req.user);
  }

  /**
   * create a relationship
   * @param {Request} req : The request object.
   * @param {AddRelationDto} body : other user's name
   */
  @UseGuards(JwtGuard)
  @Post('addRel')
  async addRelationship(@Req() req, @Body() body: AddRelationDto) {
    this.logger.log(`
      In addRel, req.user = ${req.user}, AddRelationDto = ${JSON.stringify(
      body,
    )}
    `);
    await this.relService.addRelationship(req.user, body.name);
    return await this.relService.fetchRels(req.user);
  }

  /**
   * create a relationship
   * @param {Request} req : The request object.
   * @param {AddRelationDto} body : other user's name
   */
  @UseGuards(JwtGuard)
  @Post('addRelByUserId')
  async addRelationshipByUserId(@Req() req, @Body() body: AddRelationByIdDto) {
    this.logger.log(`
      In addRelByUserId, req.user = ${req.user},
      AddRelationByIdDto = ${JSON.stringify(body)}
    `);
    await this.relService.addRelationshipByUserId(req.user, body.userId);
    return await this.relService.fetchRels(req.user);
  }

  /**
   * send a friend request
   * @param {Request} req : The request object.
   * @param {SendFriendRequestDto} body : other user's name
   */
  @UseGuards(JwtGuard)
  @Post('sendFriendship')
  async sendFriendship(@Req() req, @Body() body: SendFriendRequestDto) {
    this.logger.log('In sendFriendship');
    return this.relService.sendFriendship(req.user, body.name);
  }
  /**
   * revoke friendship
   * @param {Request} req : The request object.
   * @param {SendFriendRequestDto} body : other user's name
   */
  @UseGuards(JwtGuard)
  @Post('unsendFriendship')
  async unsendFriendship(@Req() req, @Body() body: SendFriendRequestDto) {
    this.logger.log('In unsendFriendship');
    return this.relService.unsendFriendship(req.user, body.name);
  }

  /**
   * block someone
   * @param {Request} req : The request object.
   * @param {SendFriendRequestDto} body : other user's name
   */
  @UseGuards(JwtGuard)
  @Post('sendBlock')
  async sendBlock(@Req() req, @Body() body: SendFriendRequestDto) {
    this.logger.log('In sendBlock');
    return this.relService.sendBlock(req.user, body.name);
  }
  /**
   * unblock someone
   * @param {Request} req : The request object.
   * @param {SendFriendRequestDto} body : other user's name
   */
  @UseGuards(JwtGuard)
  @Post('unsendBlock')
  async unsendBlock(@Req() req, @Body() body: SendFriendRequestDto) {
    this.logger.log('In unsendBlock');
    return this.relService.unsendBlock(req.user, body.name);
  }
}
