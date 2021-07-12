import { Model } from 'mongoose';
import { Injectable, Inject } from '@nestjs/common';
import { Post } from './posts.interface';
import { PostLikes } from './postlike.interface';
 
@Injectable()
export class PostsService {

    constructor(
        @Inject('POST_MODEL')
        private postModel: Model<Post>,
        @Inject('POSTLIKES_MODEL')
        private postLikeModel: Model<PostLikes>,
    ){}

    createPost(createPostDto): Promise<Post>{
        const post = new this.postModel(createPostDto);
        return post.save();
    }

    getAllposts(aPostIds, limit, offset){
        return this.postModel.find({_id:{$nin: aPostIds},is_blocked: '0'}).skip(offset).limit(limit).lean().exec();
    }

    getPostByID(postid, userid){
        return this.postModel.findOne({_id: postid, user_id: userid, is_blocked: '0'}).lean().exec();
    }

    deletePost(postid, userid){
        return this.postModel.deleteOne({_id: postid, user_id: userid});
    }

    updatePost(updateData, userid, postid){
        return this.postModel.findOneAndUpdate({_id: postid, user_id: userid}, {$set: updateData}, {new: true});
    }

    blockUnblock(postid, blockstatus){
        return this.postModel.updateOne({_id: postid},{$set: {'is_blocked':blockstatus, modified: new Date()}}, {new: true});
    }

    checkLikeStatus(userid, postid){
        return this.postLikeModel.findOne({user_id: userid, post_id: postid}).populate('post_id');
    }

    addLike(userid, postid): Promise<PostLikes>{
        const oPostLikes = new this.postLikeModel(); 
        oPostLikes['user_id'] = userid;
        oPostLikes['post_id'] = postid;
        return oPostLikes.save();
    }

    updateLikeCount(postid){
        return this.postModel.updateOne({_id: postid}, {$inc: {like_count: 1}}, {new: true});
    }

    getPost(postid){
        return this.postModel.findOne({_id: postid, is_blocked: "0"});
    }

    removeLike(userid, postid){
        return this.postLikeModel.deleteOne({post_id: postid, user_id: userid});
    }

    reduceLikeCount(postid, likecount){
        return this.postModel.updateOne({_id: postid}, {$set: {like_count: likecount}}, {new: true});
    }

    getTrendingData(aPostids){
        return this.postModel.find({_id: {$in: aPostids}}).lean().exec();
    }

    checkAlreadyLiked(post_id,user_id){
        return this.postLikeModel.findOne({post_id: post_id, user_id: user_id});
    }

    getTotalCount(){
        return this.postModel.count({});
    }
}
