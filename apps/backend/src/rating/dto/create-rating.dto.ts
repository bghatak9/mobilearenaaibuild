import { Type } from 'class-transformer';
import { IsInt, IsNumber, Max, Min } from 'class-validator';

export class CreateRatingDto {
  @IsNumber()
  @Min(0)
  @Max(10)
  score!: number;

  @Type(() => Number)
  @IsInt()
  deviceId!: number;
}
