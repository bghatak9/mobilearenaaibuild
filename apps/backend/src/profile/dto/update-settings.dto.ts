import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateSettingsDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  headline?: string | null;

  @IsOptional()
  @IsBoolean()
  notifyReplies?: boolean;

  @IsOptional()
  @IsBoolean()
  notifyPriceAlerts?: boolean;

  @IsOptional()
  @IsBoolean()
  notifyNewsletter?: boolean;

  @IsOptional()
  @IsBoolean()
  profilePublic?: boolean;
}
