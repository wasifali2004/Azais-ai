import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  ServiceUnavailableException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { randomInt } from "node:crypto";
import type { PlanTier } from "../generated/prisma/enums";
import { EmailService } from "../email/email.service";
import { PrismaService } from "../prisma/prisma.service";
import {
  BCRYPT_SALT_ROUNDS,
  RESEND_CODE_COOLDOWN_MS,
  SIGNUP_BONUS_CREDITS,
  VERIFICATION_CODE_TTL_MS,
} from "./auth.constants";
import type { LoginDto } from "./dto/login.dto";
import type { SignupDto } from "./dto/signup.dto";

function generateSixDigitCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

/**
 * Matches the error shapes Supabase's pooler produces when it drops or stalls a
 * connection — worth one automatic retry, unlike a validation or not-found error.
 */
function isTransientConnectionError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return (
    message.includes("Server has closed the connection") ||
    message.includes("Connection terminated") ||
    message.includes("connection timeout") ||
    message.includes("ECONNRESET")
  );
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  // In-memory per-email cooldown for /auth/resend-code. Single-instance-only —
  // would need a shared store (e.g. Redis) behind multiple API instances.
  private readonly resendCooldowns = new Map<string, number>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  private async issueVerificationCode(userId: string, email: string): Promise<void> {
    const code = generateSixDigitCode();
    const codeHash = await bcrypt.hash(code, BCRYPT_SALT_ROUNDS);

    await this.prisma.$transaction([
      // Invalidate any still-active codes for this user before issuing a new one.
      this.prisma.emailVerificationCode.updateMany({
        where: { userId, consumedAt: null },
        data: { consumedAt: new Date() },
      }),
      this.prisma.emailVerificationCode.create({
        data: {
          userId,
          codeHash,
          expiresAt: new Date(Date.now() + VERIFICATION_CODE_TTL_MS),
        },
      }),
    ]);

    this.emailService.sendVerificationCode(email, code).catch((err) => {
      this.logger.error(`Unexpected error sending verification code: ${err}`);
    });
  }

  async signup(dto: SignupDto) {
    const email = dto.email.toLowerCase().trim();

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException("An account with this email already exists");
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);

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

      return created;
    });

    await this.issueVerificationCode(user.id, user.email);

    return {
      id: user.id,
      email: user.email,
      creditBalance: user.creditBalance,
    };
  }

  async verifyEmail(email: string, code: string) {
    const normalizedEmail = email.toLowerCase().trim();
    const invalidCode = () => new UnauthorizedException("Invalid or expired verification code");

    const user = await this.prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      throw invalidCode();
    }

    const record = await this.prisma.emailVerificationCode.findFirst({
      where: { userId: user.id, consumedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    });

    if (!record) {
      throw invalidCode();
    }

    const matches = await bcrypt.compare(code, record.codeHash);
    if (!matches) {
      throw invalidCode();
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true },
      }),
      this.prisma.emailVerificationCode.update({
        where: { id: record.id },
        data: { consumedAt: new Date() },
      }),
    ]);

    return { verified: true };
  }

  async resendCode(email: string) {
    const normalizedEmail = email.toLowerCase().trim();
    const genericResponse = {
      message: "If an account exists for this email, a new code has been sent.",
    };

    const lastSent = this.resendCooldowns.get(normalizedEmail);
    if (lastSent && Date.now() - lastSent < RESEND_CODE_COOLDOWN_MS) {
      throw new BadRequestException("Please wait a moment before requesting another code");
    }

    const user = await this.prisma.user.findUnique({ where: { email: normalizedEmail } });

    // Don't leak whether the account exists or is already verified — same
    // response either way, and only actually send when there's a real,
    // unverified account to send it to.
    if (!user || user.isVerified) {
      return genericResponse;
    }

    this.resendCooldowns.set(normalizedEmail, Date.now());
    await this.issueVerificationCode(user.id, user.email);

    return genericResponse;
  }

  async login(dto: LoginDto) {
    const email = dto.email.toLowerCase().trim();
    const user = await this.withDbRetry(() => this.prisma.user.findUnique({ where: { email } }));

    // Same generic message whether the email doesn't exist, the account has
    // no password (Google-only), or the password is wrong — don't leak which
    // accounts exist or how they authenticate.
    const invalidCredentials = () =>
      new UnauthorizedException("Invalid email or password");

    if (!user || !user.passwordHash) {
      throw invalidCredentials();
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatches) {
      throw invalidCredentials();
    }

    // A distinct status (403, not 401) so the frontend can tell "wrong password"
    // apart from "right password, but this account was never verified" and route
    // to the verification screen instead of just showing an error.
    if (!user.isVerified) {
      throw new ForbiddenException("Please verify your email before signing in.");
    }

    return this.buildAuthResponse(user);
  }

  /**
   * Resolves a Google profile to a User: matches by googleId first (repeat
   * sign-in), then falls back to matching by email (an existing
   * email/password account signing in with Google for the first time) and
   * links the two rather than erroring or creating a duplicate. Only
   * creates a brand-new account when neither match is found.
   */
  async loginOrLinkGoogleUser(googleId: string, email: string) {
    return this.withDbRetry(() => this.resolveGoogleUser(googleId, email));
  }

  /**
   * Retries a DB call once after a short delay on a transient pooler
   * connection drop (Supabase's pooler occasionally closes or stalls a
   * connection). If it's still failing after the retry, the database isn't
   * reachable at all right now — surface that plainly as a 503 instead of
   * leaking a raw Prisma/pg connection error as a generic 500.
   */
  private async withDbRetry<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (err) {
      if (!isTransientConnectionError(err)) throw err;
      this.logger.warn(
        `Retrying after a transient DB connection error: ${err instanceof Error ? err.message : String(err)}`,
      );
      await new Promise((resolve) => setTimeout(resolve, 300));
      try {
        return await fn();
      } catch (retryErr) {
        if (!isTransientConnectionError(retryErr)) throw retryErr;
        throw new ServiceUnavailableException(
          "We couldn't reach the database — please try again in a moment.",
        );
      }
    }
  }

  private async resolveGoogleUser(googleId: string, email: string) {
    const normalizedEmail = email.toLowerCase().trim();

    const byGoogleId = await this.prisma.user.findUnique({ where: { googleId } });
    if (byGoogleId) {
      return byGoogleId;
    }

    const byEmail = await this.prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (byEmail) {
      // Link: Google has already verified this email, so it's at least as
      // strong a proof of ownership as our own code-verification flow.
      return this.prisma.user.update({
        where: { id: byEmail.id },
        data: { googleId, isVerified: true },
      });
    }

    return this.prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          email: normalizedEmail,
          googleId,
          isVerified: true,
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

      return created;
    });
  }

  /** Full profile for the currently authenticated user (id/email only on the JWT). */
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, plan: true, creditBalance: true, isVerified: true },
    });

    if (!user) {
      throw new UnauthorizedException("Invalid or expired session");
    }

    return user;
  }

  async buildAuthResponse(user: {
    id: string;
    email: string;
    plan: PlanTier;
    creditBalance: number;
    isVerified: boolean;
  }) {
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
