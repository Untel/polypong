import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
// import Message from 'src/chat/entities/message.entity';

export enum CoalitionChoice {
  ALLIANCE = 'alliance',
  ORDER = 'order',
  FEDERATION = 'federation',
  ASSEMBLY = 'assembly',
}

@Entity()
export class User {
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

  @Column({ type: 'text', nullable: true })
  status: string;

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

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  emailVerified: boolean;

  @Column({ nullable: true })
  socialChannel: string;

  @Column({ nullable: true })
  avatar: string;

  @Exclude()
  @CreateDateColumn()
  createdAt: Date;

  @Exclude()
  @UpdateDateColumn()
  updatedAt: Date;

  // @OneToMany(() => Message, message => message.author)
  // public message: Message;
}
