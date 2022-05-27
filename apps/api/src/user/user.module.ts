import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ForgotPasswordToken } from '../auth/entities/forgot-password-token.entity';
import { User } from './user.entity';
import { UserService } from './user.service';
// import { UserController } from './user.controller';

@Module({
  providers: [UserService],
  exports: [UserService],
  imports: [TypeOrmModule.forFeature([User, ForgotPasswordToken])],
  controllers: [/**UserController**/],
})
export class UserModule {}
