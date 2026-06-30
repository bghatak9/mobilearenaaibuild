import { IsDateString, IsOptional, IsString, Matches } from 'class-validator';

export class RevenueReportQueryDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  /** ISO 3166-1 alpha-2 code, or ALL. */
  @IsOptional()
  @IsString()
  country?: string;
}
