import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // =========================
  // REGISTER
  // =========================
  async register(email: string, password: string) {
    console.log("REGISTER START:", email);

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }

    console.log("HASHING PASSWORD...");
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("CREATING USER...");
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
      },
    });

    console.log("USER CREATED:", user.id);

    return {
      id: user.id,
      email: user.email,
      message: 'User registered successfully',
    };
  }

  // =========================
  // LOGIN
  // =========================
  async login(email: string, password: string) {
    console.log("LOGIN START:", email);

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    console.log("USER FOUND:", user ? "YES" : "NO");

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    console.log("PASSWORD VALID:", isPasswordValid);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    console.log("GENERATING TOKEN...");

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });

    console.log("TOKEN GENERATED");

    return {
      access_token: token,
    };
  }
}