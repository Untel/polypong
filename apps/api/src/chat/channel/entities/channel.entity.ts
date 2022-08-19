/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   channel.entity.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/08/12 19:15:02 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/19 04:00:28 by adda-sil         ###   ########.fr       */
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
  PRIVATE = 'private', // invisible in channel list, joignable with link?? or invitation??, without?? password
  PROTECTED = 'protected', // visible in channel list, require password
}

@Entity()
export class Channel extends RootEntity {
  @OneToMany(() => ChannelMember, (cm) => cm.user) members: ChannelMember[];

  @OneToOne(() => ThreadParticipant)
  @JoinColumn()
  initiator: ThreadParticipant;

  @OneToOne(() => Thread)
  @JoinColumn()
  thread: Thread;

  @Exclude()
  @Column({ type: 'text', nullable: true })
  password: string; // if filled, need password to enter, not incompatible with isPrivate

  @Expose()
  public get hasPassword() {
    return !!this.password;
  }

  // This ?
  // @Column({
  //   type: 'enum',
  //   enum: ChannelPrivacy,
  //   default: ChannelPrivacy.PUBLIC,
  // })
  // privacy: ChannelPrivacy;

  // Or this?
  @Column() isPrivate: boolean; // Display or not in channel list, if false can only join via link or invitation
  // If invited via invitation: no need password
  // If join by link: need password ?
}
