import { Type } from 'class-transformer';
import { RootEntity, TS } from 'src/entities';
import { User } from 'src/user/user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Match } from './match.entity';

@Entity()
export class UserMatch extends RootEntity {
  @Type(() => User)
  @ManyToOne(() => User, { nullable: false })
  public user: User;

  @Type(() => Match)
  @ManyToOne(() => Match, { nullable: false })
  public match: Match;

  @Column()
  rank: number;
}
