import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class TrackPageViewDto {
  @IsString()
  @MaxLength(64)
  visitorId!: string;

  @IsString()
  @MaxLength(512)
  path!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  referrer?: string;

  /** Client-resolved ISO country when server IP geo is unavailable (e.g. localhost). */
  @IsOptional()
  @IsString()
  @MaxLength(2)
  @Matches(/^[A-Za-z]{2}$/)
  countryCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  city?: string;
}
