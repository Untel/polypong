import { registerAs } from '@nestjs/config';

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

  ssl: false,
}));
