import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class MeDto {
  @ApiProperty({ example: 'eyhfgaskjhdfaksd...' })
  @IsString()
  userId!: string;
}
