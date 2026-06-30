import { IsString, MaxLength, MinLength } from 'class-validator';

export class AddSearchHistoryDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  query!: string;
}
