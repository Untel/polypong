import { registerAs } from '@nestjs/config';

export default registerAs('passport', () => ({
  session: true,
  property: 'user',
  defaultStrategy: 'jwt',
  secret: process.env['SESSION_SECRET'],
  saveUninitialized: false,
  resave: false,
  cookie: {
    sameSite: false,
    httpOnly: true,
    maxAge: Number(process.env['SESSION_MAXAGE']) || 60000,
  },
}));
