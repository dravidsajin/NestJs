import { Body, Controller, Post, UsePipes, Request, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
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
}
