import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as session from 'express-session';
import * as passport from 'passport';
// import * as cookieParser from 'cookie-parser';
import { configService } from './config/config.service';
import { getRepository } from 'typeorm';
import { TypeORMSession } from './auth/entities/session.entity';
import { TypeormStore } from 'connect-typeorm/out';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('Polypong')
    .setDescription('Polypong API description')
    .setVersion('1.0')
    .addTag('polypong')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Enable sessions for authentication purposes.
  // Sessions are stored in the database.
  const SESSION_SECRET = configService.getValue('SESSION_SECRET');
  app.use(
    session({
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: new TypeormStore().connect(getRepository(TypeORMSession)),
      cookie: {
        sameSite: false,
        httpOnly: true,
        maxAge: 600000,
      },
    }),
  );

  // Initliaze passport & passport session support.
  app.use(passport.initialize());
  app.use(passport.session());

  app.enableCors();

  await app.listen(3000);
}
bootstrap();
