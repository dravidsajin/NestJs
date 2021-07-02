import { IsNotEmpty, IsEmail, IsEnum, IsMobilePhone } from 'class-validator';
export class CreateUserDto {

    @IsNotEmpty()    
    readonly firstname: string;

    @IsNotEmpty()    
    readonly lastname: string;

    @IsNotEmpty()
    @IsEmail()
    readonly email: string;

    @IsNotEmpty()
    readonly password: string;

    @IsNotEmpty()
    @IsMobilePhone()
    readonly mobilenumber: string;

    @IsEnum({male: 'male', female: 'female'})
    readonly gender: string;
}
