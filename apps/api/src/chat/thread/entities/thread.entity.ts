/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   thread.entity.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/08/12 19:15:02 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/12 19:59:04 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Message } from 'src/chat/message';
import { BaseEntity } from 'src/entities/base.entity';
import { User } from 'src/user';
import { Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany } from 'typeorm';

@Entity()
export class Thread extends BaseEntity {
  @ManyToMany(() => User)
  @JoinColumn({ name: 'user_id' })
  public participants: User[];

  @OneToMany(() => Message, (message) => message.thread)
  public messages: Message[];
}
