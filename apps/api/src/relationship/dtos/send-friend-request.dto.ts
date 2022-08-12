import { IsNotEmpty } from 'class-validator';

export class SendFriendRequestDto {
  @IsNotEmpty()
  name: string;
}
