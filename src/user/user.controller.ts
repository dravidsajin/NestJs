import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, HttpException, HttpStatus, UseGuards, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ValidationPipe } from '../pipes/validation.pipes';
import { MailService } from '../mail/mail.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private mailService: MailService,
    private jwtService: JwtService
  ) {}

  @UsePipes(new ValidationPipe())
  @Post('/createuser')
  async create(@Body() createUserDto: CreateUserDto) {
    let userexistdata = await this.userService.findUserByEmail(createUserDto.email); //check user is already exist
    
    if(Array.isArray(userexistdata) && userexistdata.length){
      console.log("====already exist=======");
      throw new HttpException('User already exist', HttpStatus.OK);
    }else{
      let username = createUserDto.firstname+' '+createUserDto.lastname;
      createUserDto['created'] = new Date();
      let userDetails = await this.userService.create(createUserDto);
      await this.mailService.sendRegistrationEmail(createUserDto.email, username);//send the registration email to user

      return {
          "status": true,
          "statuscode": HttpStatus.CREATED,
          "message": "account created succesfully",
          "result": userDetails
      }
    }
  }

  @UsePipes(new ValidationPipe())
  @Post('/login')
  async login(@Body() loginUserDto: LoginUserDto){

      let user = await this.userService.findUserByEmail(loginUserDto.email); //check user is exist
      if(Array.isArray(user) && user.length){
          
          if(!bcrypt.compareSync(loginUserDto.password, user[0].password)){ // comparing passwords
              console.log("====password does not match======");
              throw new HttpException('Password wrong', HttpStatus.UNAUTHORIZED);
          }else{
              console.log("======valid credentials======");            
              let accesstoken = this.jwtService.sign({
                  user_id: user[0]._id,
                  firstname: user[0].firstname,
                  lastname: user[0].lastname,
                  email: user[0].email,
                  gender: user[0].gender,
                  mobilenumber: user[0].mobilenumber,
              });
              return {
                  "status": true,
                  "message": "logged in successfully",
                  "statuscode": HttpStatus.OK,
                  "result": {
                    firstname: user[0].firstname,
                    lastname: user[0].lastname,
                    email: user[0].email,
                    gender: user[0].gender,
                    mobilenumber: user[0].mobilenumber,
                    accesstoken: accesstoken
                  }
              }              
          }
      }else{
          console.log("====User Not Exist=======");
          throw new HttpException('Account Not Found', HttpStatus.NON_AUTHORITATIVE_INFORMATION);
      }
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async findOne(@Request() request) {
    console.log("=========tokenuserdata============");
    console.log(request.user);
    let tokendata = request.user;

    if(Object.keys(tokendata).length && tokendata.user_id){
      try{        
          let oUserData = await this.userService.findUserById(tokendata.user_id);
          if(Object.keys(oUserData).length){
              console.log("=====userfound=======");
              console.log(oUserData);
              return {
                "status": true,
                "message": "Retrieved Successfully",
                "statuscode": HttpStatus.OK,
                "result": oUserData
              }              
          }else{
              throw new HttpException('User Not Found',HttpStatus.UNAUTHORIZED);    
          }            
      }catch(e){
          console.log("=====error=======");
          console.log(e);
          throw new HttpException('Error',HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }else{
        throw new HttpException('Invalid User',HttpStatus.UNAUTHORIZED);
    }
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
