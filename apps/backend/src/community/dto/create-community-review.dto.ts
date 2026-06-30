import {
  IsArray,
  IsBoolean,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class CreateCommunityReviewDto {
  @IsInt()
  deviceId!: number;

  @IsInt()
  @Min(1)
  @Max(5)
  overallStars!: number;

  @IsObject()
  categoryScores!: Record<string, number>;

  @IsString()
  @MinLength(10)
  body!: string;

  @IsOptional()
  @IsBoolean()
  verifiedOwner?: boolean;

  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  photoUrls?: string[];

  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  videoUrls?: string[];
}

export class ReplyCommunityReviewDto {
  @IsString()
  @MinLength(2)
  body!: string;
}
