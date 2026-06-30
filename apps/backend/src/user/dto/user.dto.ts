import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { UserRole } from '@prisma/client';

import { IsStrongPassword } from '../../auth/validators/is-strong-password.validator';

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  /** Accepted only at creation; stored as bcrypt hash — never returned or viewable. */
  @ValidateIf((dto: CreateUserDto) => Boolean(dto.password?.trim()))
  @IsStrongPassword()
  password?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsEnum(UserRole)
  role!: UserRole;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @IsOptional()
  @IsBoolean()
  isBlocked?: boolean;
}

export class SendPasswordResetDto {}
