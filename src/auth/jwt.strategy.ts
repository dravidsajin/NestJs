import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { constants } from '../constants/constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
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
    if(Object.keys(userdetails).length && userdetails.user_id){
      return {
        user_id: userdetails.user_id,
        firstname: userdetails.firstname,
        lastname: userdetails.lastname,
        email: userdetails.email,
        gender: userdetails.gender,
        mobilenumber: userdetails.mobilenumber,
      }  
    }else{
      throw new HttpException('Invalid User',HttpStatus.UNAUTHORIZED);
    }        
  }
}