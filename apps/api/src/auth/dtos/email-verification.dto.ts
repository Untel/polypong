import { IsEmail } from 'class-validator';

export class EmailVerificationDto {
  @IsEmail()
  email: string;
}
