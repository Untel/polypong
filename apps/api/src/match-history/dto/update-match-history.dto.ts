import { PartialType } from '@nestjs/swagger';
import { CreateMatchHistoryDto } from './create-match-history.dto';

export class UpdateMatchHistoryDto extends PartialType(CreateMatchHistoryDto) {}
