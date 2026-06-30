import { IsEmail, IsString, MinLength } from 'class-validator';

export class VerifyEmailDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  token!: string;
}

export class ResendVerificationDto {
  @IsEmail()
  email!: string;
}
