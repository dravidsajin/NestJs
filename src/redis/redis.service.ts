import { Injectable, Inject, CACHE_MANAGER } from '@nestjs/common';
import { Cache } from "cache-manager";

@Injectable()
export class RedisService {
    constructor(
        @Inject(CACHE_MANAGER)
        private cacheManager: Cache
    ){}

    checkConnection(){
        return "redis service connected";
    }
}
