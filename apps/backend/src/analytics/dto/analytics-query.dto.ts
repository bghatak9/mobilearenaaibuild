import { IsIn, IsOptional, IsString, Matches } from 'class-validator';

export class AnalyticsQueryDto {
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  from?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  to?: string;

  /** ISO 3166-1 alpha-2 code, or ALL. */
  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  compareA?: string;

  @IsOptional()
  @IsString()
  compareB?: string;
}

export type AnalyticsFilters = {
  from?: Date;
  to?: Date;
  country?: string;
  compareA?: string;
  compareB?: string;
};

export function parseAnalyticsFilters(dto: AnalyticsQueryDto): AnalyticsFilters {
  const filters: AnalyticsFilters = {};

  if (dto.from) {
    filters.from = new Date(`${dto.from}T00:00:00.000Z`);
  }
  if (dto.to) {
    filters.to = new Date(`${dto.to}T23:59:59.999Z`);
  }
  if (dto.country && dto.country !== 'ALL') {
    filters.country = dto.country.toUpperCase();
  }
  if (dto.compareA) filters.compareA = dto.compareA.toUpperCase();
  if (dto.compareB) filters.compareB = dto.compareB.toUpperCase();

  return filters;
}
