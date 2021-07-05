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
        const post = new this.postModel(createPostDto);
        return post.save();
    }

    getAllposts(user_id){
        return this.postModel.find({user_id: user_id, is_blocked: '0'});
    }

    getPostByID(postid){
        return this.postModel.findOne({_id: postid, is_blocked: '0'})
    }
}
