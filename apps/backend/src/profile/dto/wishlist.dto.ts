import {
  IsBoolean,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';

export class UpsertWishlistDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  targetPrice?: number | null;

  @IsOptional()
  @IsBoolean()
  alertEnabled?: boolean;
}
