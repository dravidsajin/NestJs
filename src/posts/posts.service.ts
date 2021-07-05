import { Model } from 'mongoose';
import { Injectable, Inject } from '@nestjs/common';
import { Post } from './posts.interface';
 
@Injectable()
export class PostsService {

    constructor(
        @Inject('POST_MODEL')
        private postModel: Model<Post>
    ){}

    createPost(createPostDto): Promise<Post>{
        const user = new this.postModel(createPostDto);
        return user.save();
    }
}
