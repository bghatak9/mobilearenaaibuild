import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  headline?: string | null;

  /** Avatar image URL (HTTPS recommended). */
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  avatar?: string | null;
}
