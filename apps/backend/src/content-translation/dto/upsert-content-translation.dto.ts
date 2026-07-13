import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { TranslationStatus } from '@prisma/client';

export class UpsertContentTranslationDto {
  @IsOptional()
  @IsString()
  title?: string | null;

  @IsOptional()
  @IsString()
  shortName?: string | null;

  @IsOptional()
  @IsString()
  headline?: string | null;

  @IsOptional()
  @IsString()
  slug?: string | null;

  @IsOptional()
  @IsString()
  summary?: string | null;

  @IsOptional()
  @IsString()
  content?: string | null;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsString()
  seoTitle?: string | null;

  @IsOptional()
  @IsString()
  seoDescription?: string | null;

  @IsOptional()
  @IsString()
  keywords?: string | null;

  @IsOptional()
  @IsString()
  aliases?: string | null;

  @IsOptional()
  @IsEnum(TranslationStatus)
  status?: TranslationStatus | null;

  @IsOptional()
  @IsString()
  source?: string | null;

  @IsOptional()
  @IsArray()
  pros?: string[] | null;

  @IsOptional()
  @IsArray()
  cons?: string[] | null;
}
