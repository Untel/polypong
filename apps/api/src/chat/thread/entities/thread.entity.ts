/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   thread.entity.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/08/12 19:15:02 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/22 20:17:23 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Channel } from 'src/chat/channel/entities/channel.entity';
import { Message } from 'src/chat/message';
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
} from 'typeorm';
import { ThreadParticipant } from './thread-participant.entity';

@Entity()
export class Thread extends RootEntity {
  constructor(datas: Partial<Thread> = {}) {
    super();
    Object.assign(this, datas);
  }

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
  @OneToOne(() => Message, { nullable: true })
  @JoinColumn()
  public lastMessage: Message;

  @OneToOne(() => Channel, (c) => c.thread, { nullable: true })
  public channel: Channel;
}
