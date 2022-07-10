import { registerAs } from '@nestjs/config';

export const PassportConfig = registerAs('passport', () => ({
  session: false,
  property: 'user',
  defaultStrategy: 'jwt',
  secret: process.env['SESSION_SECRET'],
  // passReqToCallback: true,
  // saveUninitialized: false,
  // resave: false,
  // cookie: {
  //   sameSite: false,
  //   httpOnly: true,
  //   maxAge: Number(process.env['SESSION_MAXAGE']) || 60000,
  // },
}));
