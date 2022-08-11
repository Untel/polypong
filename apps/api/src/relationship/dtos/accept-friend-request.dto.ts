import { IsNotEmpty} from 'class-validator';

export class AcceptFriendRequestDto {
  @IsNotEmpty()
  name: string;
}
