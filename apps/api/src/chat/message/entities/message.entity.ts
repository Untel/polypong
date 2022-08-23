/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   message.entity.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/08/12 19:15:02 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/23 16:35:56 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Thread } from 'src/chat/thread';
import { ThreadParticipant } from 'src/chat/thread/entities/thread-participant.entity';
import { RootEntity } from 'src/entities/root.entity';
import { Column, Entity, ManyToMany, ManyToOne } from 'typeorm';

@Entity({ orderBy: { createdAt: 'DESC' } })
export class Message extends RootEntity {
  @Column('text')
  content: string;

  // If null, then system message
  @ManyToOne(() => ThreadParticipant, (tp) => tp.sentMessages) // Bind to User or ThreadParticipant ?
  public sender: ThreadParticipant;

  @ManyToMany(() => ThreadParticipant) // Bind to User or ThreadParticipant ?
  public likes: ThreadParticipant;

  @ManyToOne(() => Thread, (thread) => thread.messages) // Is it needed if thread participant as sender??
  public thread: Thread;

  // We don't need it if the Thread contain the entire list of participant ?
  // @ManyToMany(() => User)
  // public mentions: User;

  // reactions
  // attachments
  // -> link preview / image / video / voice / geoloc
}
