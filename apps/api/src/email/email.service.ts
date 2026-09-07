import { Injectable, Logger } from "@nestjs/common";
import { Resend } from "resend";

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  // Resend's constructor throws if no API key is given, so this stays unset
  // until a real key is configured rather than crashing app boot.
  private readonly resend = process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : null;

  private readonly fromEmail =
    process.env.RESEND_FROM_EMAIL ?? "AzaisAi <onboarding@resend.dev>";

  async sendVerificationCode(to: string, code: string): Promise<void> {
    if (!this.resend) {
      this.logger.warn(
        `RESEND_API_KEY not set — skipping send. Verification code for ${to}: ${code}`,
      );
      return;
    }

    const { error } = await this.resend.emails.send({
      from: this.fromEmail,
      to,
      subject: "Your AzaisAi verification code",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>Verify your email</h2>
          <p>Your verification code is:</p>
          <p style="font-size:32px;font-weight:bold;letter-spacing:6px;color:#2563eb;">${code}</p>
          <p style="color:#999;font-size:12px;">This code expires in 10 minutes. If you didn't request this, ignore this email.</p>
        </div>
      `,
    });

    if (error) {
      // Never let an email-provider outage take down signup — log and move on.
      // The user can request a new code via /auth/resend-code.
      this.logger.error(`Failed to send verification code to ${to}: ${error.message}`);
    }
  }
}
