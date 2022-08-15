/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   thread.entity.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/08/12 19:15:02 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/15 14:22:56 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

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
  @OneToMany(() => ThreadParticipant, (tp) => tp.thread)
  public participants: ThreadParticipant[];

  @OneToMany(() => Message, (m) => m.thread)
  public messages: Message[];

  /**
   * Could be usefull to load the thread without loading all messages
   * Ex: have the last text and lastMessage to sort thread with last activity
   */
  @OneToOne(() => Message)
  public lastMessage: Message;
}
