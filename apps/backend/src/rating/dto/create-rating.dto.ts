import { IsInt, IsNumber, Max, Min } from 'class-validator';

export class CreateRatingDto {
  @IsNumber()
  @Min(0)
  @Max(10)
  score!: number;

  @IsInt()
  userId!: number;

  @IsInt()
  deviceId!: number;
}
