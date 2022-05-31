import { Injectable, Logger } from '@nestjs/common';
import { TypeOrmModuleOptions } from'@nestjs/typeorm';

@Injectable()
export class ConfigService {

  logger = new Logger('config');

  constructor(private env: { [k: string]: string | undefined }) { }

  getValue(key: string, throwOnMissing = true): string {
    const value = this.env[key];
    if (!value && throwOnMissing) {
      throw new Error(`MISSING ENV in ConfigService : env.${key} = ${value}`);
    }
    this.logger.log(`env[${key}] = ${this.env[key]}`);
    return value;
  }

  public ensureValues(keys: string[]) {
    keys.forEach(k =>this.getValue(k, true));
    return this;
  }

  public isProduction() {
    const mode = this.getValue('MODE', false);
    return mode != 'DEV';
  }

  public getTypeOrmConfig(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.getValue('POSTGRES_HOST'),
      port: parseInt(this.getValue('POSTGRES_PORT')),
      username: this.getValue('POSTGRES_USER'),
      password: this.getValue('POSTGRES_PASSWORD'),
      database: this.getValue('POSTGRES_DB'),

      entities: ['dist/**/*.entity{.ts,.js}'],
      synchronize: true,

      migrationsTableName: 'migration',

      migrations: ['src/migration/*.ts'],

      // cli: {
      //   migrationsDir: 'src/migration',
      // },

      // TODO : set to true once in production
      ssl: false,
    };
  }

  public getJwtConfig() {
    return {
      secret: this.getValue('JWT_SECRET'),
      refresh_secret: this.getValue('JWT_REFRESH_SECRET'),
      expiration: parseInt(this.getValue('JWT_EXPIRATION')),
      refresh_expiration: parseInt(this.getValue('JWT_REFRESH_EXPIRATION')),
    };
  }
}


const configService = new ConfigService(process.env).ensureValues([
    'JWT_SECRET',
    'JWT_EXPIRATION',
    'JWT_REFRESH_SECRET',
    'JWT_REFRESH_EXPIRATION',

    'SESSION_SECRET',

    'GOOGLE_CLIENT_ID',
    'GOOGLE_SECRET',
    'GOOGLE_CALLBACK',

    'INTRA_CLIENT_ID',
    'INTRA_SECRET',
    'INTRA_CALLBACK',
    'INTRA_AUTHORIZATION_URL',
    'INTRA_TOKEN_ENDPOINT',

    'POSTGRES_PORT',
    'POSTGRES_USER',
    'POSTGRES_HOST',
    'POSTGRES_PASSWORD',
    'POSTGRES_DB',

    'FRONTEND_URL',

    'TWO_FACTOR_AUTHENTICATION_APP_NAME',
  ]
);

export { configService };