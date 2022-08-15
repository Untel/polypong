import { RootEntity, TS } from 'src/entities';
import { Column, Entity, OneToMany } from 'typeorm';
import { UserMatch } from '.';

@Entity()
export class Match extends RootEntity {
  @OneToMany(() => UserMatch, (user) => user.match)
  players: UserMatch[];

  @Column()
  totalPlayers: number;

  @Column({ type: 'timestamp' })
  finishedAt: TS;
}
