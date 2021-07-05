import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { constants } from '../constants/constants';
import { UserService } from '../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private userservice:UserService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: constants.secret,
    });
  }

  async validate(userdetails: any) {
    console.log("=========tokenuserdata============");
    console.log(userdetails);
    try{
      if(Object.keys(userdetails).length && userdetails.user_id){
        let ouserdata = await this.userservice.findUserById(userdetails.user_id);
        if(Object.keys(ouserdata).length){
          return {
            user_id: userdetails.user_id,
            firstname: userdetails.firstname,
            lastname: userdetails.lastname,
            email: userdetails.email,
            gender: userdetails.gender,
            mobilenumber: userdetails.mobilenumber,
            user_role: ouserdata.role || 'member'
          }
        }else{
          throw new HttpException('Invalid User details. Please check your email and password',HttpStatus.UNAUTHORIZED);
        }          
      }else{
        throw new HttpException('Invalid User',HttpStatus.UNAUTHORIZED);
      }
    }catch(error){
      let err = {err: error};
      throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
    }     
  }
}