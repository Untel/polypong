import { registerAs } from '@nestjs/config';

export const RedisConfig = registerAs('redis', () => ({
  readyLog: true,
  config: {
    host: 'redis',
    onClientCreated(client) {
      console.log('Redis client created', client);
      client.on('error', (err) => {
        console.log('Redis error', err);
      });
    },
  },
}));
