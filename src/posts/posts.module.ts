import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { DatabaseModule } from '../database/database.module';
import { postProviders } from '../providers/post.providers';
import { postLikeProviders } from '../providers/postlike.providers';
import { UserModule } from '../user/user.module';
import { RedisModule } from '../redis/redis.module';

@Module({
    imports: [DatabaseModule, UserModule, RedisModule],
    controllers: [PostsController],
    providers: [
        PostsService,
        ...postProviders,
        ...postLikeProviders
    ]
})
export class PostsModule {}
