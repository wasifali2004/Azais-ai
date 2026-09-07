import { Injectable } from "@nestjs/common";
import { Resend } from "resend";

@Injectable()
export class EmailService {
  // Resend's constructor throws if no API key is given, so this stays unset
  // until a real key is configured rather than crashing app boot.
  private readonly resend = process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : null;

  // TODO: no real template yet — wire this up once the verification flow is designed.
  async sendVerificationEmail(to: string, verificationToken: string): Promise<void> {
    if (!this.resend) {
      console.warn(
        `[EmailService] sendVerificationEmail stub called for ${to} (token: ${verificationToken}) — RESEND_API_KEY not set, nothing sent`,
      );
      return;
    }
    console.warn(
      `[EmailService] sendVerificationEmail stub called for ${to} (token: ${verificationToken}) — not implemented yet`,
    );
  }
}
