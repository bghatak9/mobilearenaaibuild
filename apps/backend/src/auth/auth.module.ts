import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { AdminAuthController, AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { EmailVerificationService } from './email-verification.service';
import { PasswordResetService } from './password-reset.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [AuthService, PasswordResetService, EmailVerificationService, JwtStrategy],
  controllers: [AuthController, AdminAuthController],
  exports: [AuthService, PasswordResetService, EmailVerificationService],
})
export class AuthModule {}
