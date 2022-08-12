/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   message.entity.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/08/12 19:15:02 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/12 21:44:17 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Thread } from 'src/chat/thread';
import { BaseEntity } from 'src/entities/base.entity';
import { User } from 'src/user/user.entity';
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne } from 'typeorm';

@Entity()
export class Message extends BaseEntity {
  @Column('text')
  content: string;

  @ManyToOne(() => User)
  public sender: User;

  @ManyToMany(() => User)
  public mentions: User;

  @ManyToOne(() => Thread, (thread) => thread.messages)
  public thread: Thread;
}
