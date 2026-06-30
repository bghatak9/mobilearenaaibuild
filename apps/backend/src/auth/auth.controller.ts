import { Body, Controller, Get, Post } from '@nestjs/common';

import { AuthService } from './auth.service';
import {
  DevSocialSignInDto,
  FacebookSignInDto,
  GoogleSignInDto,
  LoginDto,
  RegisterDto,
  RequestPasswordResetDto,
  ResetPasswordWithOtpDto,
} from './dto/auth.dto';
import {
  ResendVerificationDto,
  VerifyEmailDto,
} from './dto/verify-email.dto';
import { EmailVerificationService } from './email-verification.service';
import { PasswordResetService } from './password-reset.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly passwordReset: PasswordResetService,
    private readonly emailVerification: EmailVerificationService,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.auth.register(dto.email, dto.password, dto.name);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password);
  }

  @Get('social-config')
  socialConfig() {
    const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim() ?? '';
    const facebookAppId = process.env.FACEBOOK_APP_ID?.trim() ?? '';
    const facebookAppSecret = process.env.FACEBOOK_APP_SECRET?.trim() ?? '';
    const devMode = this.auth.isSocialAuthDevMode();
    const facebookConfigured =
      facebookAppId.length > 0 && facebookAppSecret.length > 0;

    return {
      googleClientId: googleClientId || (devMode ? '__dev__' : ''),
      facebookAppId: facebookAppId || (devMode ? '__dev__' : ''),
      googleSignInEnabled: googleClientId.length > 0 || devMode,
      facebookSignInEnabled: facebookConfigured || devMode,
      googleUseDevFlow: devMode && !googleClientId,
      facebookUseDevFlow: devMode && !facebookConfigured,
    };
  }

  @Post('dev/social')
  async devSocial(@Body() dto: DevSocialSignInDto) {
    return this.auth.devSocialSignIn(dto.provider, dto.email);
  }

  @Post('google')
  async google(@Body() dto: GoogleSignInDto) {
    return this.auth.googleSignIn(dto.idToken);
  }

  @Post('facebook')
  async facebook(@Body() dto: FacebookSignInDto) {
    return this.auth.facebookSignIn(dto.accessToken);
  }

  @Post('forgot-password/request')
  async requestReset(@Body() dto: RequestPasswordResetDto) {
    return this.passwordReset.requestEmailReset(dto.email);
  }

  @Post('forgot-password/reset')
  async resetPassword(@Body() dto: ResetPasswordWithOtpDto) {
    return this.passwordReset.resetWithEmailOtp(
      dto.email,
      dto.otp,
      dto.newPassword,
    );
  }

  @Post('verify-email')
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.emailVerification.verify(dto.email, dto.token);
  }

  @Post('resend-verification')
  async resendVerification(@Body() dto: ResendVerificationDto) {
    await this.emailVerification.assertCanResend(dto.email);
    return this.emailVerification.resend(dto.email);
  }
}

@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password, true);
  }

  @Post('google')
  async google(@Body() dto: GoogleSignInDto) {
    return this.auth.googleSignIn(dto.idToken, true);
  }
}
