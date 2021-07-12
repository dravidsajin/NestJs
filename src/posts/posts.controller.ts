import { Body, Controller, Post, Get, UsePipes, Request, UseGuards, HttpException, HttpStatus, Delete, Param, Patch } from '@nestjs/common';
import { ValidationPipe } from '../pipes/validation.pipes';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RedisService } from '../redis/redis.service';

@Controller('posts')
export class PostsController {

    constructor(    
        private postService: PostsService,
        private redisService: RedisService
    ){}
    
    @UseGuards(JwtAuthGuard)
    @UsePipes(new ValidationPipe())
    @Post('/createPost')
    async createPost(@Request() request,@Body() createPostDto:CreatePostDto){
        
        if(request.user.user_id){
            let postType = createPostDto.post_type;
            let imgurl = createPostDto.post_imgurl;
            if(postType == 'image' && !imgurl){
                throw new HttpException('Invalid image url', HttpStatus.INTERNAL_SERVER_ERROR);    
            }else{
                createPostDto['user_id'] = request.user.user_id;
                let postRes = await this.postService.createPost(createPostDto);
                return {
                    status: true,
                    statuscode: HttpStatus.OK,
                    message: 'post created successfully',
                    result: postRes
                }
            }                    
        }else{
            throw new HttpException('Invalid User',HttpStatus.UNAUTHORIZED);
        }
    }

    @UseGuards(JwtAuthGuard)    
    @Get('/getAll/:page')
    async getAllposts(@Request() request, @Param('page') page){
        if(request.user.user_id){
            let aPostIds = [];
            let aTrendingPosts = [];
            let user_id = request.user.user_id;
            let pageNumber = parseInt(page);
            let offset = pageNumber > 1 ? (pageNumber - 1) * 10 : 0;
            let limit = 10;
            let aTrendingPostids = await this.redisService.getTrendingData(limit, offset);            
            if(Array.isArray(aTrendingPostids) && aTrendingPostids.length){
                aPostIds = aTrendingPostids.map((obj) => {
                    let splitedpostid = obj.split('post_');
                    return splitedpostid[1];
                });       
                if(aPostIds.length){
                    aTrendingPosts = await this.postService.getTrendingData(aPostIds);// get the trending post data        
                    if(aTrendingPosts.length){                        
                        await Promise.all(aTrendingPosts.map(async (post, index) => {                            
                            let olikeData = await this.postService.checkAlreadyLiked(post._id, user_id); //check the post is liked by the user or not                              
                            if(olikeData && Object.keys(olikeData).length){
                                aTrendingPosts[index]['likestatus'] = true;
                            }else{
                                aTrendingPosts[index]['likestatus'] = false;
                            }
                            console.log(aTrendingPosts[index]);
                        }));
                    }                    
                }     
            }            
            let aPostAllData = await Promise.all([this.postService.getAllposts(aPostIds, limit, offset), this.postService.getTotalCount()]);//get all the posts from database            
            if(aPostAllData[0].length){
                await Promise.all(aPostAllData[0].map(async (post, index) => {                
                   let olikeData = await this.postService.checkAlreadyLiked(post._id, user_id); //check the post is liked by the user or not                   
                   if(olikeData && Object.keys(olikeData).length){
                    aPostAllData[0][index]['likestatus'] = true;
                   }else{
                    aPostAllData[0][index]['likestatus'] = false;
                   }                   
                }));
            }       
                    
            return {
                status: true,
                statuscode: HttpStatus.OK,
                message: 'posts retrieved successfully',
                trendingposts: aTrendingPosts,
                posts: aPostAllData[0],
                totalcount: aPostAllData[1]
            }
        }else{
            throw new HttpException('Invalid User',HttpStatus.UNAUTHORIZED);
        }
    }

    @UseGuards(JwtAuthGuard)    
    @Get('/getPost/:postid')
    async getPost(@Request() request, @Param('postid') postid){        
        if(request.user.user_id){
            if(postid){                    
                let postDetails = await this.postService.getPostByID(postid, request.user.user_id);
                if(postDetails && Object.keys(postDetails).length){
                    let olikedata = await this.postService.checkAlreadyLiked(postDetails._id, request.user.user_id)//check user like status
                    if(olikedata && Object.keys(olikedata).length){
                        postDetails['likestatus'] = true;
                    }else{
                        postDetails['likestatus'] = false;
                    }
                    return {
                        status: true,
                        statuscode: HttpStatus.OK,
                        message: 'post retrieved successfully',
                        result: postDetails
                    }
                }else{
                    throw new HttpException('Post Not Found',HttpStatus.OK);            
                }                               
            }else{
                throw new HttpException('Invalid post id',HttpStatus.INTERNAL_SERVER_ERROR);    
            }
        }else{
            throw new HttpException('Invalid User',HttpStatus.UNAUTHORIZED);
        }        
    }

    @UseGuards(JwtAuthGuard)    
    @Delete('/deletePost/:postid')
    async deletePost(@Request() request,@Param('postid') postid){
        if(request.user.user_id){
            if(postid){
                let deleteRes = await Promise.all([this.postService.deletePost(postid, request.user.user_id), this.redisService.removePostData(postid)]);
                if(deleteRes[0].deletedCount == 1){
                    return {
                        status: true,
                        statuscode: HttpStatus.OK,
                        message: 'post deleted successfully'                        
                    }
                }else{
                    throw new HttpException('Could not delete the post or post is already been deleted',HttpStatus.OK);
                }
            }else{
                throw new HttpException('Invalid post id',HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }else{
            throw new HttpException('Invalid User',HttpStatus.UNAUTHORIZED);
        }
    }

    @UseGuards(JwtAuthGuard)    
    @Patch('/editPost/:postid')
    async editPost(@Request() request,@Body() updateUserDto: UpdatePostDto, @Param('postid') postid){
        if(request.user.user_id){
            if(postid){                                
                let postDetails = await this.postService.getPostByID(postid, request.user.user_id);
                console.log(postDetails)
                if(postDetails){
                    let json = {
                        post_content: updateUserDto.post_content || postDetails.post_content,
                        modified: new Date() 
                    }
                    let updateRes = await this.postService.updatePost(json, request.user.user_id, postid);
                    return {
                        status: true,
                        statuscode: HttpStatus.OK,
                        message: 'post updated successfully',
                        result: updateRes
                    }
                }else{
                    throw new HttpException('Could not update the post',HttpStatus.OK);
                }
            }else{
                throw new HttpException('Invalid post id',HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }else{
            throw new HttpException('Invalid User',HttpStatus.UNAUTHORIZED);
        }
    }

    @UseGuards(JwtAuthGuard)    
    @Patch('/blockunblock/:postid')
    async blockunblock(@Request() request,@Param('postid') postid){
        if(request.user.user_id){
            if(postid){
                if(request.user.user_role == 'admin'){
                    let blockstatus = request.body.status;
                    if(!blockstatus || (blockstatus != '1' && blockstatus != '0')){
                        throw new HttpException("Invalid block status",HttpStatus.INTERNAL_SERVER_ERROR);        
                    }else{
                        let updatedRes = await this.postService.blockUnblock(postid, blockstatus);
                        return {
                            status: true,
                            statuscode: HttpStatus.OK,
                            message: (blockstatus == '1') ? 'post blocked successfully' : 'post unblocked successfully',
                            result: updatedRes
                        }
                    }                    
                }else{
                    throw new HttpException("You don't have permission to block the post",HttpStatus.UNAUTHORIZED);    
                }
            }else{
                throw new HttpException('Invalid post id',HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }else{
            throw new HttpException('Invalid User',HttpStatus.UNAUTHORIZED);
        }
    }

    @UseGuards(JwtAuthGuard)    
    @Post('/likeunlike')
    async likeunlike(@Request() request,@Body('post_id') postid){    
        if(request.user.user_id){
            if(postid){
                let userid = request.user.user_id;
                let postData = await this.postService.getPost(postid);//check post exist
                console.log(postData);
                if(postData && Object.keys(postData).length){
                    let oLikedata = await this.postService.checkLikeStatus(userid, postid);// check user already liked this post
                    console.log(oLikedata)
                    console.log("=====post like data=======");                    
                    if(oLikedata && Object.keys(oLikedata).length){ //if already found unlike post
                        console.log("===getting in");
                        console.log(oLikedata);
                        let likecount = parseInt(oLikedata.post_id[0]['like_count']);
                        likecount = (likecount > 0) ? likecount - 1 : 0;

                        await Promise.all([this.postService.removeLike(userid, postid), this.postService.reduceLikeCount(postid, likecount),this.redisService.reducePostLikeCount(postid)]);
                                            
                        let response = await this.postService.getPost(postid);
                        return {
                            status: true,
                            statuscode: HttpStatus.OK,
                            message: "post unliked",
                            result: response 
                        }
                    }else{ // add the like no data found

                        await Promise.all([this.postService.addLike(userid, postid), this.postService.updateLikeCount(postid), this.redisService.addPostLikeCount(postid)]);
                        let response = await this.postService.getPost(postid); //get the post data
                        
                        return {
                            status: true,
                            statuscode: HttpStatus.OK,
                            message: "post liked",
                            result: response 
                        }
                    }
                }else{
                    throw new HttpException('Post Not Found',HttpStatus.OK);    
                }                
            }else{
                throw new HttpException('Invalid post id',HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }else{
            throw new HttpException('Invalid User',HttpStatus.UNAUTHORIZED);
        }
    }

    @Get('/checkredisconnection')
    async checkredisconnection(){
        return await this.redisService.removePostData('dsadsadsad');        
    }
}
