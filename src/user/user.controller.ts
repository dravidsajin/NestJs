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
      throw new HttpException('User already exist', HttpStatus.BAD_REQUEST);
    }else{
      let username = createUserDto.firstname+' '+createUserDto.lastname;
      createUserDto['created'] = new Date();
      let userDetails = await this.userService.create(createUserDto);
      console.log(userDetails);
      /* await this.mailService.sendRegistrationEmail(createUserDto.email, username); */
      //send the registration email to user

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
                  "statusCode": HttpStatus.OK,
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

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async findOne(@Request() request) {
    let tokendata = request.user;
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
    }catch(error){
        console.log("=====error=======");
        console.log(error);
        throw new HttpException(error,HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/updateuser')
  async update(@Body() updateUserDto: UpdateUserDto, @Request() request) {
    let tokendata = request.user;    
    try {
      let oUserData = await this.userService.findUserById(tokendata.user_id); // check user is eixst or not
      if(Object.keys(oUserData).length){
          console.log("=====userfound=======");
          console.log(oUserData);
          let updateData = {
              firstname: updateUserDto.firstname || oUserData.firstname,
              lastname: updateUserDto.lastname || oUserData.lastname,
              mobilenumber: updateUserDto.mobilenumber || oUserData.mobilenumber              
          }
          console.log(updateUserDto.password);
          if(updateUserDto.password){
              let salt = await bcrypt.genSalt(10);
              let hash = await bcrypt.hash(updateUserDto.password, salt);
              updateData['password'] = hash;
          }

          console.log("=====update user data======"); 
          console.log(updateData);

          let updatedata = await this.userService.updateUserByID(updateData, tokendata.user_id);          
          return {
            "status": true,
            "message": "Updated Successfully",
            "statuscode": HttpStatus.OK,
            "result": updatedata
          }
      }else{
          throw new HttpException('User Not Found',HttpStatus.UNAUTHORIZED);
      }
    } catch (error) {
        console.log("=====error=======");
        console.log(error);
        throw new HttpException(error,HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/deleteuser')
  async deleteuser(@Request() request) {    
    let user_id = request.user.user_id;
    try {
       console.log(`=====deleteuserid${user_id}`);
       let deleteRes = await this.userService.deleteByUserID(user_id);
       if(deleteRes.deletedCount == 1){
          return {
            "status": true,
            "message": "Acccount Deleted Successfully",
            "statuscode": HttpStatus.OK
          }
       }else{
          return {
            "status": true,
            "message": "Acccount Not Deleted",
            "statuscode": HttpStatus.OK
          }
       }
    } catch (error) {
      console.log("=====error=======");
      console.log(error);
      throw new HttpException(error,HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
