import { IsArray, IsEnum, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class ModerateCommentDto {
  @IsEnum(['approve', 'reject', 'spam'])
  action!: 'approve' | 'reject' | 'spam';

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class BulkModerateCommentsDto {
  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  ids!: number[];

  @IsEnum(['approve', 'reject', 'spam'])
  action!: 'approve' | 'reject' | 'spam';
}
