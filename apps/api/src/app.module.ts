import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { MulterModule } from '@nestjs/platform-express';
import { AuthModule } from './auth/auth.module';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { MailModule } from './mail/mail.module';

import { configService } from './config/config.service';


import { PongModule } from './pong/pong.module';
@Module({
  imports: [
    // GraphQLModule.forRoot<ApolloDriverConfig>({
    //   driver: ApolloDriver,
    //   debug: true,
    //   playground: true,
    //   autoSchemaFile: 'graphql/schema.gql',
    // }),
    TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
    UserModule,
    MailModule,
    AuthModule,
    PongModule,
    MulterModule.register({
      dest: './avatars',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
