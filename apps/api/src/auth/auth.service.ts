import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { EmailService } from "../email/email.service";
import { PrismaService } from "../prisma/prisma.service";
import {
  BCRYPT_SALT_ROUNDS,
  SIGNUP_BONUS_CREDITS,
  VERIFICATION_TOKEN_TTL_MS,
} from "./auth.constants";
import type { LoginDto } from "./dto/login.dto";
import type { SignupDto } from "./dto/signup.dto";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  async signup(dto: SignupDto) {
    const email = dto.email.toLowerCase().trim();

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException("An account with this email already exists");
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);
    const verificationToken = randomBytes(32).toString("hex");

    const user = await this.prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          email,
          passwordHash,
          creditBalance: SIGNUP_BONUS_CREDITS,
        },
      });

      await tx.creditTransaction.create({
        data: {
          userId: created.id,
          amount: SIGNUP_BONUS_CREDITS,
          reason: "SIGNUP_BONUS",
        },
      });

      await tx.verificationToken.create({
        data: {
          userId: created.id,
          token: verificationToken,
          expiresAt: new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS),
        },
      });

      return created;
    });

    // Fire-and-forget: a Resend outage must not fail signup. EmailService
    // itself catches and logs send errors — see EmailService.sendVerificationEmail.
    this.emailService.sendVerificationEmail(user.email, verificationToken).catch((err) => {
      this.logger.error(`Unexpected error sending verification email: ${err}`);
    });

    return {
      id: user.id,
      email: user.email,
      creditBalance: user.creditBalance,
    };
  }

  async verifyEmail(token: string) {
    const record = await this.prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!record || record.consumedAt || record.expiresAt < new Date()) {
      throw new UnauthorizedException("Invalid or expired verification token");
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: record.userId },
        data: { isVerified: true },
      }),
      this.prisma.verificationToken.update({
        where: { id: record.id },
        data: { consumedAt: new Date() },
      }),
    ]);

    return { verified: true };
  }

  async login(dto: LoginDto) {
    const email = dto.email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({ where: { email } });

    // Same generic message whether the email doesn't exist or the password is
    // wrong — don't leak which accounts exist.
    const invalidCredentials = () =>
      new UnauthorizedException("Invalid email or password");

    if (!user) {
      throw invalidCredentials();
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatches) {
      throw invalidCredentials();
    }

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        plan: user.plan,
        creditBalance: user.creditBalance,
        isVerified: user.isVerified,
      },
    };
  }
}
