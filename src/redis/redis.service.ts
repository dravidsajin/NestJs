import { Injectable } from '@nestjs/common';
import * as redis from 'redis';
import { constants } from '../constants/constants';

@Injectable()
export class RedisService {
    public redisclient: any;
    public redispostgroup: string;
    public redispostid: string;
    public redispostlikecount: string;
    public postset: string;
    public redisincrvalue;
    public redisdecrvalue;
    constructor(){
        this.redisclient = redis.createClient({
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_PORT
        });
        // assigning constant
        this.redispostgroup = constants.redispost_group;
        this.redispostid = constants.redispost_id;
        this.redispostlikecount = constants.redispost_likecount;
        this.redisincrvalue = constants.redispost_incrvalue;
        this.redisdecrvalue = constants.redispost_decrvalue;
    }

    checkConnection(){ // sample connection
        // return "service connected";
        this.setRedisPostId('dsadsadsad'); 
        console.log(this.postset);    
    }
    
    setRedisPostId(postid){
        this.postset = 'post_'+postid;
    }

    addToGroup(){
        this.redisclient.sadd(this.redispostgroup,this.postset);
    }

    setGroupPostid(postid){
        this.redisclient.hset(this.postset,this.redispostid,postid);
    }

    incrdecrvalue(value){
        this.redisclient.hincrby(this.postset,this.redispostlikecount, value);	
    }

    getPostLikeCount(){
        return new Promise((resolve, reject) => {
            this.redisclient.hget(this.postset,this.redispostlikecount,(err, data) => {
                if (err) {
                    reject(err);
                }
                resolve(data);
            });
        });
    }

    async addPostLikeCount(postid){
        this.setRedisPostId(postid); //set the postid set
        this.addToGroup(); // add to group
        this.setGroupPostid(postid); // set the postid
        this.incrdecrvalue(this.redisincrvalue);		
		this.redisclient.expire(this.postset, 86400);
		this.redisclient.ttl(this.postset);
        return await this.getPostLikeCount();        
    }    

    async reducePostLikeCount(postid){
        this.setRedisPostId(postid); //set the postid set
        let likecount = await this.getPostLikeCount();
        if(Number(likecount) == 0){
            return likecount;
        }else{
            this.addToGroup(); // add to group
            this.setGroupPostid(postid); // set the postid
            this.incrdecrvalue(this.redisdecrvalue);	
            this.redisclient.expire(this.postset, 86400);
            this.redisclient.ttl(this.postset);
            return;
        }                               
    }

    async getTrendingData(limit, offset){
        return new Promise((resolve, reject) => {
            this.redisclient.sort(this.redispostgroup, "by","*->likecount","LIMIT",offset,limit,"DESC", (err, data) => {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                resolve(data);
            });
        });
    }

    removeDataFromGroup(){
        this.redisclient.srem(this.redispostgroup, this.postset);
    }

    deletePostObjects(){
        this.redisclient.hdel(this.postset, this.redispostid, this.redispostlikecount);
    }

    removePostData(postid){
        this.setRedisPostId(postid); //set the postid set
        this.removeDataFromGroup();
        this.deletePostObjects();
        return;
    }
}
