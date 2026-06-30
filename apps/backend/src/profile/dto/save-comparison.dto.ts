import { IsArray, IsOptional, IsString, ArrayMinSize } from 'class-validator';

export class SaveComparisonDto {
  @IsArray()
  @ArrayMinSize(2)
  @IsString({ each: true })
  deviceSlugs!: string[];

  @IsOptional()
  @IsString()
  name?: string;
}
