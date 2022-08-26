/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   user.entity.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/08/15 01:10:24 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/15 16:15:37 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Exclude, Type } from 'class-transformer';
import { Relationship } from 'src/relationship/relationship.entity';
import { NoIdBaseEntity } from 'src/entities';
import { UserMatch } from 'src/match-history';

export enum CoalitionChoice {
  ALLIANCE = 'alliance',
  ORDER = 'order',
  FEDERATION = 'federation',
  ASSEMBLY = 'assembly',
}

@Entity()
export class User extends NoIdBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Exclude()
  @Column({ nullable: true })
  twoFactorAuthenticationSecret?: string;

  @Column({ default: false })
  public isTwoFactorAuthenticationEnabled: boolean;

  @Column({ type: 'text', unique: true })
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({
    type: 'enum',
    enum: CoalitionChoice,
    default: null,
  })
  coalition: CoalitionChoice;

  @Exclude()
  @Column({ nullable: true })
  password: string;

  @Column({ default: false })
  emailVerified: boolean;

  @Column({ nullable: true })
  socialChannel: string;

  @Column({ nullable: true })
  avatar: string;

  @OneToMany(() => Relationship, (relationship) => relationship.from)
  relationships: Relationship[];

  @OneToMany(() => Relationship, (relationship) => relationship.to)
  related: Relationship[];

  @Type(() => UserMatch)
  @OneToMany(() => UserMatch, (match) => match.user)
  matchHistory: UserMatch[];
}
