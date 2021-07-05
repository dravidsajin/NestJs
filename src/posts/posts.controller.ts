import { Body, Controller, Post, Get, UsePipes, Request, UseGuards, HttpException, HttpStatus, Query, Param } from '@nestjs/common';
import { ValidationPipe } from '../pipes/validation.pipes';
import { CreatePostDto } from './dto/create-post.dto';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('posts')
export class PostsController {

    constructor(    
        private postService: PostsService
    ){}
    
    @UseGuards(JwtAuthGuard)
    @UsePipes(new ValidationPipe())
    @Post('/createPost')
    async createPost(@Request() request,@Body() createPostDto:CreatePostDto){
        
        if(request.user.user_id){
            let postType = createPostDto.post_type;
            let imgurl = createPostDto.post_imgurl;
            if(postType == 'image' && imgurl){
                throw new HttpException('Invalid image url', HttpStatus.INTERNAL_SERVER_ERROR);    
            }else{
                createPostDto['user_id'] = request.user.user_id;
                let postRes = await this.postService.createPost(createPostDto);
                return {
                    'status': true,
                    'statuscode': HttpStatus.OK,
                    'message': 'post created successfully',
                    'result': postRes
                }
            }                    
        }else{
            throw new HttpException('Invalid User',HttpStatus.UNAUTHORIZED);
        }
    }

    @UseGuards(JwtAuthGuard)    
    @Get('/getAll')
    async getAllposts(@Request() request){
        if(request.user.user_id){
            let user_id = request.user.user_id;
            let aPosts = await this.postService.getAllposts(user_id);//get all the posts from database
            return {
                'status': true,
                'statuscode': HttpStatus.OK,
                'message': 'posts retrieved successfully',
                'result': aPosts
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
                let postDetails = await this.postService.getPostByID(postid);
                if(postDetails && Object.keys(postDetails).length){
                    return {
                        'status': true,
                        'statuscode': HttpStatus.OK,
                        'message': 'post retrieved successfully',
                        'result': postDetails
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
}
