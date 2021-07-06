import { Injectable } from '@nestjs/common';
import * as redis from 'redis';

@Injectable()
export class RedisService {
    public client: any;
    constructor(){
        this.client = redis.createClient({
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_PORT
        });
    }

    checkConnection(){
        this.client.sadd('SampleGroup','Name');
    }
}
