/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   thread-participant.entity.ts                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/08/12 19:15:02 by adda-sil          #+#    #+#             */
/*   Updated: 2022/09/12 10:55:19 by adda-sil         ###   ########.fr       */
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
  Index,
} from 'typeorm';

export enum ThreadMemberStatus {
  MEMBER,
  ADMIN,
  OWNER,
}

@Entity({ orderBy: { status: 'ASC' } })
@Index(['user', 'thread'], { unique: true })
export class ThreadParticipant extends RootEntity {
  @ManyToOne(() => User, { eager: true, cascade: false })
  public user: User;

  @ManyToOne(() => Thread, { onDelete: 'CASCADE' })
  public thread: Thread;

  @CreateDateColumn({ type: 'timestamp' })
  public sawUntil: TS;

  @Column({
    type: 'enum',
    enum: ThreadMemberStatus,
    default: ThreadMemberStatus.MEMBER,
  })
  status: ThreadMemberStatus;

  @Column({ type: 'timestamp', nullable: true })
  public isBanUntil: TS;

  @Column({ type: 'timestamp', nullable: true })
  public isMuteUntil: TS;

  @Column({ type: 'timestamp', nullable: true })
  public hasMuteUntil: TS;
}
