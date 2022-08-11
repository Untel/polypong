import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocketModule } from 'src/socket';
import { UserModule } from 'src/user';
import { RelationshipController } from './relationship.controller';
import { Relationship } from './relationship.entity';
import { RelationshipService } from './relationship.service';

@Module({
  providers: [RelationshipService],
  exports: [],
  imports: [UserModule, SocketModule, TypeOrmModule.forFeature([Relationship])],
  controllers: [RelationshipController],
})
export class RelationshipModule {}
