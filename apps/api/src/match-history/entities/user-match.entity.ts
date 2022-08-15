import { RootEntity, TS } from 'src/entities';
import { User } from 'src/user/user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Match } from './match.entity';

@Entity()
export class UserMatch extends RootEntity {
  @ManyToOne(() => User)
  public user: User;

  @ManyToOne(() => Match)
  public match: Match;

  @Column()
  rank: number;
}
