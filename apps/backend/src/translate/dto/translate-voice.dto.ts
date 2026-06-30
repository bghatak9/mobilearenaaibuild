import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

const SUPPORTED = [
  'auto',
  'en',
  'hi',
  'es',
  'fr',
  'de',
  'pt',
  'ja',
  'ko',
  'zh',
  'ar',
  'id',
] as const;

export class TranslateVoiceDto {
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  text!: string;

  @IsOptional()
  @IsIn(SUPPORTED)
  source?: (typeof SUPPORTED)[number];

  @IsOptional()
  @IsIn(SUPPORTED.filter((c) => c !== 'auto'))
  target?: Exclude<(typeof SUPPORTED)[number], 'auto'>;
}
