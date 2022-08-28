/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   thread.entity.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/08/12 19:15:02 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/27 21:27:50 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Expose } from 'class-transformer';
import { Channel } from 'src/chat/channel/entities/channel.entity';
import { Message } from 'src/chat/message';
import { NoIdBaseEntity, RootEntity } from 'src/entities/root.entity';
import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ThreadParticipant } from './thread-participant.entity';

@Entity()
export class Thread extends RootEntity {
  @OneToMany(() => ThreadParticipant, (tp) => tp.thread, {
    cascade: true,
    eager: true,
  })
  public participants: ThreadParticipant[];

  @OneToMany(() => Message, (m) => m.thread, { cascade: true })
  public messages: Message[];

  /**
   * Could be usefull to load the thread without loading all messages
   * Ex: have the last text and lastMessage to sort thread with last activity
   */
  public lastMessage: Message;
  public unreadMessages: Message[];
  public unreadCount: number;
  public me: ThreadParticipant;

  @Expose()
  public get isDirectMessage() {
    return !this.channel;
  }

  @OneToOne(() => Channel, (c) => c.thread, { nullable: true })
  public channel: Channel;

  @Column({ nullable: true })
  key: string;
}
