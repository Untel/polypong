/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   thread-participant.entity.ts                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/08/12 19:15:02 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/13 23:56:27 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Expose } from 'class-transformer';
import { Thread } from 'src';
import { Message } from 'src/chat/message';
import { BaseEntity, TS } from 'src/entities/base.entity';
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
} from 'typeorm';

@Entity()
export class ThreadParticipant extends BaseEntity {
  @ManyToOne(() => User)
  public user: User;

  @ManyToOne(() => Thread)
  public thread: Thread;

  @OneToMany(() => Message, (m) => m.sender)
  sentMessages: Message[];

  @Column({ type: 'timestamp' })
  public sawUntil: TS;

  @Expose()
  public get isUnread() {
    return (
      this.thread.lastMessage &&
      this.sawUntil < this.thread.lastMessage.createdAt &&
      this.hasMuteUntil < new TS()
    );
  }
  // @Column({ type: 'timestamp' })
  // public joinedAt: Date;

  // @Column({ type: 'timestamp' })
  // public leftAt: Date;

  @Column({ type: 'timestamp' })
  public hasMuteUntil: TS;
}
