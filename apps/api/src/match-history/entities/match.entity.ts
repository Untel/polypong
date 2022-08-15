import { Type } from 'class-transformer';
import { RootEntity, TS } from 'src/entities';
import { Column, Entity, OneToMany } from 'typeorm';
import { UserMatch } from '.';

@Entity()
export class Match extends RootEntity {
  @Type(() => UserMatch)
  @OneToMany(() => UserMatch, (user) => user.match)
  players: UserMatch[];

  @Column()
  totalPlayers: number;

  @Column()
  botCount: number;

  @Column({ type: 'timestamp', nullable: true })
  finishedAt: TS;

  @Column()
  name: string;
}
