import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { userProviders } from '../providers/user.providers';
import { DatabaseModule } from '../database/database.module'; 
import { MailModule } from '../mail/mail.module';
import { JwtModule } from '@nestjs/jwt';
import { constants } from '../constants/constants';

@Module({
  imports: [
    DatabaseModule, 
    MailModule, 
    JwtModule.register({
      secret: constants.secret,
      signOptions: { expiresIn: '300s' },
      })
    ],
  controllers: [UserController],
  providers: [
    UserService,
    ...userProviders
  ]
})
export class UserModule {}
