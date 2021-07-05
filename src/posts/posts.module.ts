import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { DatabaseModule } from '../database/database.module';
import { postProviders } from '../providers/post.providers';
import { UserModule } from '../user/user.module';

@Module({
    imports: [DatabaseModule, UserModule],
    controllers: [PostsController],
    providers: [
        PostsService,
        ...postProviders
    ]
})
export class PostsModule {}
