import { Model } from 'mongoose';
import { Injectable, Inject } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user.interface';

@Injectable()
export class UserService {
  constructor(
    @Inject('USER_MODEL')
    private userModel: Model<User>
  ){    
  }
  create(createUserDto: CreateUserDto): Promise<User> {
    const user = new this.userModel(createUserDto);
    return user.save();
  }

  findUserByEmail(email: string){
      return this.userModel.find({email: email});
  }

  findUserById(user_id: string){
      return this.userModel.findOne({_id: user_id});
  }

  updateUserByID(updatedata, userid){
      return this.userModel.findOneAndUpdate({_id: userid}, {$set: updatedata}, {new: true});
  }

  deleteByUserID(user_id: string){
      return this.userModel.deleteOne({_id: user_id});
  }
}
