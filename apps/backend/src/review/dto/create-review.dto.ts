import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateReviewDto {
  @IsString()
  title!: string;

  // Optional: derived from `title` when omitted.
  @IsOptional()
  @IsString()
  slug?: string;

  @IsString()
  content!: string;

  @IsNumber()
  @Min(0)
  @Max(10)
  score!: number;

  @IsOptional()
  @IsArray()
  pros?: string[];

  @IsOptional()
  @IsArray()
  cons?: string[];

  @IsInt()
  deviceId!: number;

  @IsOptional()
  @IsString()
  publishedAt?: string;
}
