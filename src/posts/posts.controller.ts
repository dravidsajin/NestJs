import { Body, Controller, Post, UsePipes, Request, UseGuards } from '@nestjs/common';
import { ValidationPipe } from '../pipes/validation.pipes';
import { CreatePostDto } from './dto/create-post.dto';
import { UserService } from '../user/user.service';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('posts')
export class PostsController {

    constructor(
        private userService: UserService,
        private postService: PostsService
    ){}
    
    @UseGuards(JwtAuthGuard)
    @UsePipes(new ValidationPipe())
    @Post('/createPost')
    async createPost(@Request() request,@Body() createPostDto:CreatePostDto){
        
        console.log(request.user);
        // let userexistdata = await this.userService.findUserByEmail(createUserDto.email); //check user is already exist
    }
}
