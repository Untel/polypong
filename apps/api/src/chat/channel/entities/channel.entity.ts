/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   channel.entity.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/08/12 19:15:02 by adda-sil          #+#    #+#             */
/*   Updated: 2022/09/12 10:58:50 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Exclude, Expose } from 'class-transformer';
import { Message } from 'src/chat/message';
import { Thread } from 'src/chat/thread';
import { ThreadParticipant } from 'src/chat/thread/entities/thread-participant.entity';
import { RootEntity } from 'src/entities/root.entity';
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
} from 'typeorm';
import { ChannelMember } from './channel-member.entity';

export enum ChannelPrivacy {
  PUBLIC = 'public', // visible in channel list, joignable without password
  PRIVATE = 'private', // invisible in channel list, joignable with invitation
  PROTECTED = 'protected', // visible in channel list, require password
}

@Entity()
export class Channel extends RootEntity {
  @ManyToOne(() => User, { eager: true })
  @JoinColumn()
  initiator: User;

  @OneToOne(() => Thread, { cascade: true })
  @JoinColumn()
  thread: Thread;

  @Exclude()
  @Column({ type: 'text', nullable: true })
  password: string; // if filled, need password to enter, not incompatible with isPrivate

  @Expose()
  public get hasPassword() {
    return !!this.password;
  }

  @Column({ nullable: true })
  name: string;

  @Column({
    type: 'enum',
    enum: ChannelPrivacy,
    default: ChannelPrivacy.PUBLIC,
  })
  privacy: ChannelPrivacy;
}
