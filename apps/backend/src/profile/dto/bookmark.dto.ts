import { BookmarkEntityType } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateBookmarkDto {
  @IsEnum(BookmarkEntityType)
  entityType!: BookmarkEntityType;

  @IsInt()
  entityId!: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  slug?: string;
}
