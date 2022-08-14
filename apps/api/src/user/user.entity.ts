import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Relationship } from 'src/relationship/relationship.entity';
import { NoIdBaseEntity } from 'src/entities';
// import Message from 'src/chat/entities/message.entity';

export enum CoalitionChoice {
  ALLIANCE = 'alliance',
  ORDER = 'order',
  FEDERATION = 'federation',
  ASSEMBLY = 'assembly',
}

@Entity()
export class User extends NoIdBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Exclude()
  @Column({ nullable: true })
  twoFactorAuthenticationSecret?: string;

  @Exclude()
  @Column({ default: false })
  public isTwoFactorAuthenticationEnabled: boolean;

  @Column({ type: 'text', unique: true })
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({
    type: 'enum',
    enum: CoalitionChoice,
    default: null,
  })
  coalition: CoalitionChoice;

  @Exclude()
  @Column({ nullable: true })
  password: string;

  @Column({ default: false })
  emailVerified: boolean;

  @Column({ nullable: true })
  socialChannel: string;

  @Column({ nullable: true })
  avatar: string;

  @OneToMany(() => Relationship, (relationship) => relationship.from)
  relationships: Relationship[];

  @OneToMany(() => Relationship, (relationship) => relationship.to)
  related: Relationship[];
}
