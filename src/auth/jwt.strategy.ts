import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
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
    return {
        user_id: userdetails.user_id,
        firstname: userdetails.firstname,
        lastname: userdetails.lastname,
        email: userdetails.email,
        gender: userdetails.gender,
        mobilenumber: userdetails.mobilenumber,
    }      
  }
}