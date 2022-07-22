import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ForgotPasswordToken } from '../auth/entities/forgot-password-token.entity';
import { User } from './user.entity';
import { UserService } from './user.service';
 import { UserController } from './user.controller';
import { AuthModule } from 'src/auth';

@Module({
  providers: [UserService],
  exports: [UserService],
  imports: [
    TypeOrmModule.forFeature([User, ForgotPasswordToken]),
    forwardRef(() => AuthModule),
  ],
  controllers: [UserController],
})
export class UserModule {}
