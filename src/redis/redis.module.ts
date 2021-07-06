import { CacheModule, Module } from '@nestjs/common';
import * as redisStore from "cache-manager-redis-store";
import { RedisService } from './redis.service';

@Module({
  imports: [
    CacheModule.register({
        store: redisStore,
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
    }),
  ],
  providers: [RedisService],
  exports: [RedisService]
})
export class RedisModule {}
