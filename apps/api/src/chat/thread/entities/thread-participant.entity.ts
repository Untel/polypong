/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   thread-participant.entity.ts                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/08/12 19:15:02 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/18 19:07:38 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Expose } from 'class-transformer';
import { Thread } from 'src';
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
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class ThreadParticipant extends RootEntity {
  constructor(datas: Partial<ThreadParticipant> = {}) {
    super();
    Object.assign(this, datas);
  }

  @ManyToOne(() => User)
  public user: User;

  @ManyToOne(() => Thread)
  public thread: Thread;

  @OneToMany(() => Message, (m) => m.sender)
  sentMessages: Message[];

  @CreateDateColumn({ type: 'timestamp' })
  public sawUntil: TS;

  // @Expose()
  // public get isUnread() {
  //   return (
  //     this.thread.lastMessage &&
  //     this.sawUntil < this.thread.lastMessage.createdAt &&
  //     this.hasMuteUntil < new TS()
  //   );
  // }
  // @Column({ type: 'timestamp' })
  // public joinedAt: Date;

  // @Column({ type: 'timestamp' })
  // public leftAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  public hasMuteUntil: TS;
}
