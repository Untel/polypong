import { Type } from 'class-transformer';
import { RootEntity, TS } from 'src/entities';
import { User } from 'src/user/user.entity';
import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { Match } from './match.entity';

@Entity()
@Index(['user', 'match'], { unique: true })
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
