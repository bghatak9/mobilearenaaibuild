import { IsIn, IsInt, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class VotePollDto {
  @IsString()
  pollSlug!: string;

  @IsString()
  choiceId!: string;
}

export class CreateReportDto {
  @IsIn(['COMMENT', 'REVIEW', 'USER', 'DISCUSSION'])
  entityType!: string;

  @IsInt()
  entityId!: number;

  @IsString()
  @MinLength(3)
  @MaxLength(500)
  reason!: string;
}

export class CreateDiscussionDto {
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  title!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  body!: string;

  @IsOptional()
  @IsInt()
  deviceId?: number;
}
