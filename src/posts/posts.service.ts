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

    getPostByID(postid, userid){
        return this.postModel.findOne({_id: postid, user_id: userid, is_blocked: '0'});
    }

    deletePost(postid, userid){
        return this.postModel.deleteOne({_id: postid, user_id: userid});
    }

    updatePost(updateData, userid, postid){
        return this.postModel.findOneAndUpdate({_id: postid, user_id: userid}, updateData, {new: true});
    }
}
