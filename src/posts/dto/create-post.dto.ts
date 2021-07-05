import { IsNotEmpty, IsEnum } from 'class-validator';
export class CreatePostDto {

    @IsNotEmpty()    
    public post_content: string;
    
    public post_imgurl: string;

    @IsNotEmpty()    
    readonly user_id: string;

    @IsEnum({text: 'text', image: 'image'})
    readonly post_type: string;
}
