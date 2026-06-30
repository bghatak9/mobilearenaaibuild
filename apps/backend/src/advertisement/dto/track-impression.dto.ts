import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class TrackImpressionDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  placement?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  path?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  visitorId?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[A-Za-z]{2}$/)
  countryCode?: string;
}
