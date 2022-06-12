import { Module } from '@nestjs/common';
import { createClient, RedisClientOptions } from 'redis';


export const REDIS = Symbol('AUTH:REDIS');
const opts: RedisClientOptions = {
  host: 'redis',
};


@Module({
  providers: [
    {
      provide: REDIS,
      useValue: createClient(opts),
    },
  ],
  exports: [REDIS],
})
export class RedisModule {}
