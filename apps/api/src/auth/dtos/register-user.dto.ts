import { IsEmail, IsNotEmpty } from 'class-validator';
import { CoalitionChoice } from 'src/user/user.entity';

export class RegisterUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  coalition: CoalitionChoice;
}
