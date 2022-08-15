/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   base.entity.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/08/12 19:11:29 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/14 23:53:25 by adda-sil         ###   ########.fr       */
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

// Can change the extends
export class TS extends Date {}

export abstract class NoIdBaseEntity extends TypeormBaseEntity {
  @ApiProperty()
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: TS;

  @ApiProperty()
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: TS;

  @ApiProperty()
  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: TS;
}

export abstract class BaseEntity extends NoIdBaseEntity {
  @ApiProperty({ example: 'c057cc8c-ad1b-4081-ba05-41a648e29f19' })
  @PrimaryGeneratedColumn('uuid')
  id: string;
}
