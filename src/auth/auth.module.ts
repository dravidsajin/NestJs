import { Module } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
// import { UserModule } from '../user/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { constants } from '../constants/constants';

@Module({
  imports: [
    // UserModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: constants.secret,
      signOptions: { expiresIn: '300s' },
    }),
  ],
  providers: [JwtStrategy],
  exports: [],
})
export class AuthModule {}