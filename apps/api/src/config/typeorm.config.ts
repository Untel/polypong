/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   typeorm.config.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/08/12 21:54:43 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/15 10:32:41 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { registerAs } from '@nestjs/config';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

export const TypeormConfig = registerAs('typeorm', () => ({
  type: 'postgres',
  host: process.env['POSTGRES_HOST'],
  port: process.env['POSTGRES_PORT'],
  username: process.env['POSTGRES_USER'],
  password: process.env['POSTGRES_PASSWORD'],
  database: process.env['POSTGRES_DB'],

  entities: ['dist/**/*.entity{.ts,.js}'],
  synchronize: true,

  migrationsTableName: 'migration',
  migrations: ['src/migration/*.ts'],

  namingStrategy: new SnakeNamingStrategy(),

  ssl: false,
}));
