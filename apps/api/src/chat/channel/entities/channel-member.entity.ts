/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   channel-member.entity.ts                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/08/12 19:15:02 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/29 02:12:02 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Channel } from './channel.entity';
import { Message } from 'src/chat/message';
import { RootEntity, TS } from 'src/entities/root.entity';
import { User } from 'src/user';
import {
  Entity,
  ManyToMany,
  OneToMany,
  JoinColumn,
  ManyToOne,
  JoinTable,
  OneToOne,
  Column,
  Unique,
  Index,
} from 'typeorm';
import { ThreadParticipant } from 'src/chat/thread/entities/thread-participant.entity';

export enum ChannelMemberStatus {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
  BAN = 'ban',
}

@Entity()
@Index(['user', 'channel'], { unique: true })
export class ChannelMember extends RootEntity {
  @ManyToOne(() => User)
  public user: User;

  @ManyToOne(() => Channel)
  public channel: Channel;

  // @Column({ type: 'timestamp' })
  // public administrator: Date;

  // @Column()
  // public isOwner: boolean;

  // Prefer administratorSince + isOwner
  // Or status enum (Owner, Admin, Member)

  @Column({
    type: 'enum',
    enum: ChannelMemberStatus,
    default: ChannelMemberStatus.MEMBER,
  })
  status: ChannelMemberStatus;

  @Column({ type: 'timestamp' })
  public isBanUntil: TS;

  @Column({ type: 'timestamp' })
  public isMuteUntil: TS;
}
