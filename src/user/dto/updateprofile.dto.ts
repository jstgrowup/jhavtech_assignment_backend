import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsEnum,
  IsArray,
  IsUrl,
  IsOptional,
  Min,
  Max,
  ValidateIf,
} from 'class-validator';
import { Gender } from '../schemas/user.schema';
import { Transform } from 'class-transformer';

export class UpdateProfileDto {
  // ── Basic Info ───────────────────────────────────────────────────

  @ApiPropertyOptional({ example: 'Subham Dey' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 25 })
  @IsOptional()
  @IsInt()
  @Min(18)
  age?: number;

  @ApiPropertyOptional({ enum: Gender, example: Gender.MALE })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({ example: 'mumbai' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    example: ['hiking', 'chess', 'cooking'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  interests?: string[];

  @ApiPropertyOptional({ example: 'https://example.com/photo.jpg' })
  @IsOptional()
  @ValidateIf((o) => o.photoUrl !== '' && o.photoUrl !== null) // ← only validate if non-empty
  @IsUrl({}, { message: 'photoUrl must be a valid URL' })
  @Transform(({ value }) => (value === '' ? null : value)) // ← convert empty string to null
  photoUrl?: string;

  // ── Preferences ──────────────────────────────────────────────────

  @ApiPropertyOptional({ enum: Gender, example: Gender.FEMALE, nullable: true })
  @IsOptional()
  @IsEnum(Gender)
  preferredGender?: Gender | null;

  @ApiPropertyOptional({ example: 21 })
  @IsOptional()
  @IsInt()
  @Min(18)
  preferredAgeMin?: number;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @IsInt()
  @Max(100)
  preferredAgeMax?: number;
}
