import { Optional } from '@nestjs/common';
import { IsNotEmpty } from 'class-validator';

export class AddRelationByIdDto {
  @IsNotEmpty()
  userId: number;

  @Optional()
  friendship_sent: boolean;

  @Optional()
  friendship_received: boolean;

  @Optional()
  block_sent: boolean;

  @Optional()
  block_received: boolean;
}
