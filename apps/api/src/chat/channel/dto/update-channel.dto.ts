import { PartialType } from '@nestjs/swagger';
import { ChannelPrivacy } from '../entities';
import { CreateChannelDto } from './create-channel.dto';

export class UpdateChannelDto extends PartialType(CreateChannelDto) {
  privacy: ChannelPrivacy;
  password: string;
  name: string;
}
