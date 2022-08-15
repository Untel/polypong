/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   forgot-password-token.entity.ts                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/08/14 00:54:41 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/14 00:54:42 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class ForgotPasswordToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column({ length: 400 })
  token: string;

  @CreateDateColumn()
  createdAtt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
