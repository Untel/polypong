import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SocketService } from 'src/socket/socket.service';
import { UserService, User } from 'src/user';
import { Repository } from 'typeorm';
import { Relationship } from './relationship.entity';

@Injectable()
export class RelationshipService {
  constructor(
    private userService: UserService,
    private socketService: SocketService,

    @InjectRepository(Relationship)
    private relRepo: Repository<Relationship>,
  ) {}

  logger = new Logger(`relationshipService`);

  // find a relationship between two Users
  async findRel(from: User, to: User): Promise<Relationship> | null {
    const res = await this.relRepo
      .createQueryBuilder('')
      .where({ from: from, to: to })
      .getOne(); // idk why but getMany() doesnt return all the data
    this.logger.log(`in findRel, res = ${JSON.stringify(res)}`);
    return res;
  }

  // return all the relationships of an user
  async fetchRels(from: User): Promise<any> | null {
    this.logger.log(`in fetchRels - from : ${JSON.stringify(from)}`);
    try {
      const res = await this.relRepo
        .createQueryBuilder('rel')
        .where({ from: from })
        .select(['rel', 'to.name', 'to.avatar'])
        .leftJoin('rel.to', 'to')
        .getMany();
      this.logger.log(`in fetchRels, res = ${JSON.stringify(res)}`);
      return res;
    } catch (error) {
      this.logger.log(`in fetchRels, error: ` + error);
      return null;
    }
  }

  async createRelationship(
    from: User,
    to: User,
    friendship_sent?: boolean,
    friendship_received?: boolean,
    block_sent?: boolean,
    block_received?: boolean,
  ) {
    this.logger.log(
      `in createRelationship, from.email = ${from.email}, to.email = ${to.email}`,
    );
    if (from.id === to.id) {
      throw new BadRequestException('Cannot create relationship with yourself');
    }
    const newRel = await this.relRepo.create({
      from: from,
      to: to,
      friendship_sent: friendship_sent,
      friendship_received: friendship_received,
      block_sent: block_sent,
      block_received: block_received,
    });
    const res = await this.relRepo.save(newRel);
    return res;
  }

  async addRelationship(from: User, name: string) {
    this.logger.log(
      `in addRelationship, from.email = ${from.email}, name = ${name}`,
    );
    const to = await this.userService.find({ name });
    if (!to) {
      throw new BadRequestException(`no results for ${name}`);
    }
    const existingRel = await this.findRel(from, to);
    if (existingRel) {
      throw new BadRequestException(
        `Cannot add ${name} because relation already exists`,
      );
    }
    const newRel = this.createRelationship(from, to);
    return newRel;
  }

  async updateRel(rel: Relationship, properties: any) {
    this.logger.log(`in updateRel, rel = ${JSON.stringify(rel)}`);
    this.logger.log(`in updateRel, properties = ${JSON.stringify(properties)}`);

    if (!rel) {
      throw new BadRequestException('User not found');
    }

    try {
      const updatedRel = await this.relRepo.save({
        ...rel,
        ...properties,
      });
      this.logger.log(
        `in updateRel, after update rel = ${JSON.stringify(updatedRel)}`,
      );
      return updatedRel;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async sendFriendship(from: User, name: string) {
    this.logger.log(
      `in sendFriendship, from.name = ${from.name}, name = ${name}`,
    );
    const to = await this.userService.find({ name });
    this.logger.log(`in sendFriendship, found user 'to' : ${to.name}`);
    if (!to) {
      throw new BadRequestException(`No matching user for name = ${name}`);
    }
    let fromRel = await this.findRel(from, to);
    if (!fromRel) {
      fromRel = await this.createRelationship(from, to);
    }
    this.logger.log(`in sendFriendship, fromRel = ${JSON.stringify(fromRel)}`);
    let toRel = await this.findRel(to, from);
    if (!toRel) {
      toRel = await this.createRelationship(to, from);
    }
    this.logger.log(`in sendFriendship, toRel = ${JSON.stringify(toRel)}`);
    await this.updateRel(fromRel, { friendship_sent: true });
    await this.updateRel(toRel, { friendship_received: true });
    this.logger.log(`in sendFriendship, about to emit event`);
    this.logger.log(`in sendFriendship, to = ${JSON.stringify(to)}`);
    const sock = await this.socketService.getUserSocket(to.id);
    console.log(`in sendFriendship, sock = `, sock);
    sock?.emit('friendship', from.id, 'received');
    return await this.fetchRels(from);
  }

  async unsendFriendship(from: User, name: string) {
    this.logger.log(
      `in unsendFriendship, from.name = ${from.name}, name = ${name}`,
    );
    const to = await this.userService.find({ name });
    this.logger.log(`in unsendFriendship, found user 'to' : ${to.name}`);
    if (!to) {
      throw new BadRequestException(`No matching user for name = ${name}`);
    }
    let fromRel = await this.findRel(from, to);
    if (!fromRel) {
      fromRel = await this.createRelationship(from, to);
    }
    this.logger.log(
      `in unsendFriendship, fromRel = ${JSON.stringify(fromRel)}`,
    );
    let toRel = await this.findRel(to, from);
    if (!toRel) {
      toRel = await this.createRelationship(to, from);
    }
    this.logger.log(`in unsendFriendship, toRel = ${JSON.stringify(toRel)}`);
    await this.updateRel(fromRel, {
      friendship_sent: false,
      friendship_received: false,
    });
    await this.updateRel(toRel, {
      friendship_received: false,
      friendship_sent: false,
    });
    await this.socketService
      .getUserSocket(to.id)
      ?.emit('friendship', from.id, 'revoked', false);
    return await this.fetchRels(from);
  }

  async sendBlock(from: User, name: string) {
    this.logger.log(
      `in sendBlock, from.name = ${from.name}, name = ${name}`,
    );
    const to = await this.userService.find({ name });
    this.logger.log(`in sendBlock, found user 'to' : ${to.name}`);
    if (!to) {
      throw new BadRequestException(`No matching user for name = ${name}`);
    }
    let fromRel = await this.findRel(from, to);
    if (!fromRel) {
      fromRel = await this.createRelationship(from, to);
    }
    this.logger.log(`in sendBlock, fromRel = ${JSON.stringify(fromRel)}`);
    let toRel = await this.findRel(to, from);
    if (!toRel) {
      toRel = await this.createRelationship(to, from);
    }
    this.logger.log(`in sendBlock, toRel = ${JSON.stringify(toRel)}`);
    await this.updateRel(fromRel, {
      block_sent: true, friendship_sent: false, friendship_received: false,
    });
    await this.updateRel(toRel, {
      block_received: true, friendship_sent: false, friendship_received: false,
    });
    this.logger.log(`in sendBlock, about to emit event`);
    this.logger.log(`in sendBlock, to = ${JSON.stringify(to)}`);
    const sock = await this.socketService.getUserSocket(to.id);
    console.log(`in sendBlock, sock = `, sock);
    sock?.emit('block', from.id, 'received');
    return await this.fetchRels(from);
  }

  async unsendBlock(from: User, name: string) {
    this.logger.log(
      `in unsendBlock, from.name = ${from.name}, name = ${name}`,
    );
    const to = await this.userService.find({ name });
    this.logger.log(`in unsendBlock, found user 'to' : ${to.name}`);
    if (!to) {
      throw new BadRequestException(`No matching user for name = ${name}`);
    }
    let fromRel = await this.findRel(from, to);
    if (!fromRel) {
      fromRel = await this.createRelationship(from, to);
    }
    this.logger.log(
      `in unsendBlock, fromRel = ${JSON.stringify(fromRel)}`,
    );
    let toRel = await this.findRel(to, from);
    if (!toRel) {
      toRel = await this.createRelationship(to, from);
    }
    this.logger.log(`in unsendBlock, toRel = ${JSON.stringify(toRel)}`);
    await this.updateRel(fromRel, { block_sent: false });
    await this.updateRel(toRel, { block_received: false });
    await this.socketService
      .getUserSocket(to.id)
      ?.emit('block', from.id, 'revoked', false);
    return await this.fetchRels(from);
  }
}
