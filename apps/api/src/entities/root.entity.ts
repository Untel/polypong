/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   root.entity.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/08/12 19:11:29 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/22 21:02:51 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { ApiProperty } from '@nestjs/swagger';
import {
  BaseEntity,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

// Can change the extends
export class TS extends Date {
  static ASC: 'ASC' = 'ASC';
  static DESC: 'DESC' = 'DESC';
  static ts() {
    // return Date.now();
    return new Date();
  }
}

// export class ID extends Number {}
export type ID = number;

export abstract class NoIdBaseEntity extends BaseEntity {
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

export abstract class RootEntity extends NoIdBaseEntity {
  // constructor(datas: Partial<RootEntity> = {}) {
  //   super();
  //   Object.assign(this, datas);
  // }

  @ApiProperty({ example: 'c057cc8c-ad1b-4081-ba05-41a648e29f19' })
  @PrimaryGeneratedColumn()
  id: ID;
}
