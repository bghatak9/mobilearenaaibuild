import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

import { IsStrongPassword } from '../validators/is-strong-password.validator';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsStrongPassword()
  password!: string;

  @IsOptional()
  @IsString()
  name?: string;
}

export class LoginDto {
  @IsString()
  @MinLength(1)
  email!: string;

  @IsString()
  @MinLength(1)
  password!: string;
}

export class GoogleSignInDto {
  @IsString()
  idToken!: string;
}

export class FacebookSignInDto {
  @IsString()
  accessToken!: string;
}

export class DevSocialSignInDto {
  @IsString()
  @Matches(/^(google|facebook)$/)
  provider!: 'google' | 'facebook';

  @IsEmail()
  email!: string;
}

export class RequestPasswordResetDto {
  @IsEmail()
  email!: string;
}

export class ResetPasswordWithOtpDto {
  @IsEmail()
  email!: string;

  @IsString()
  @Matches(/^\d{6}$/, { message: 'OTP must be a 6-digit code' })
  otp!: string;

  @IsString()
  @IsStrongPassword()
  newPassword!: string;
}
