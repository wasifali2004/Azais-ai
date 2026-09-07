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

  private readonly frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:3000";

  async sendVerificationEmail(to: string, verificationToken: string): Promise<void> {
    const verifyUrl = `${this.frontendUrl}/verify-email?token=${verificationToken}`;

    if (!this.resend) {
      this.logger.warn(
        `RESEND_API_KEY not set — skipping send. Verification link for ${to}: ${verifyUrl}`,
      );
      return;
    }

    const { error } = await this.resend.emails.send({
      from: this.fromEmail,
      to,
      subject: "Verify your AzaisAi email",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>Verify your email</h2>
          <p>Confirm your email address to finish setting up your AzaisAi account.</p>
          <p>
            <a href="${verifyUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none;">
              Verify email
            </a>
          </p>
          <p>Or paste this link into your browser:</p>
          <p style="word-break:break-all;color:#666;">${verifyUrl}</p>
          <p style="color:#999;font-size:12px;">This link expires in 24 hours. If you didn't create this account, ignore this email.</p>
        </div>
      `,
    });

    if (error) {
      // Never let an email-provider outage take down signup — log and move on.
      // The user can still verify later; a resend endpoint is a future-work item.
      this.logger.error(`Failed to send verification email to ${to}: ${error.message}`);
    }
  }
}
