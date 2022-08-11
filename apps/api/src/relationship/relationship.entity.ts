import { User } from 'src/user/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Relationship {
  @PrimaryGeneratedColumn()
  id: number;

  @PrimaryColumn({ name: 'fromId' })
  fromId: number;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'fromId' })
  from: User;

  @PrimaryColumn({ name: 'toId' })
  toId: number;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'toId' })
  to: User;

  @Column({ default: false })
  friendship_sent: boolean;

  @Column({ default: false })
  friendship_received: boolean;

  @Column({ default: false })
  block_sent: boolean;

  @Column({ default: false })
  block_received: boolean;
}
