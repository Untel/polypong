/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   base.entity.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/08/12 19:11:29 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/12 21:42:15 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { ApiProperty } from '@nestjs/swagger';
import {
  BaseEntity as TypeormBaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class BaseEntity extends TypeormBaseEntity {
  @ApiProperty({ example: 'c057cc8c-ad1b-4081-ba05-41a648e29f19' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @ApiProperty()
  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: Date;
}
