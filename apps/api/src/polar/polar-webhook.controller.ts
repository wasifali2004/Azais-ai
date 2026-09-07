import { Controller, Logger, Post, Req, UnauthorizedException } from "@nestjs/common";
import type { RawBodyRequest } from "@nestjs/common";
import { validateEvent, WebhookVerificationError } from "@polar-sh/sdk/webhooks";
import type { Request } from "express";
import { Public } from "../common/decorators/public.decorator";
import { PolarService } from "./polar.service";

@Controller("webhooks/polar")
export class PolarWebhookController {
  private readonly logger = new Logger(PolarWebhookController.name);

  constructor(private readonly polarService: PolarService) {}

  @Public()
  @Post()
  async handle(@Req() req: RawBodyRequest<Request>) {
    const secret = process.env.POLAR_WEBHOOK_SECRET;
    if (!secret) {
      // Fail closed: never process an unverifiable payload.
      this.logger.error("POLAR_WEBHOOK_SECRET is not set — rejecting webhook");
      throw new UnauthorizedException();
    }

    let event: ReturnType<typeof validateEvent>;
    try {
      event = validateEvent(req.rawBody ?? Buffer.alloc(0), req.headers as Record<string, string>, secret);
    } catch (err) {
      if (err instanceof WebhookVerificationError) {
        throw new UnauthorizedException("Invalid webhook signature");
      }
      throw err;
    }

    await this.polarService.handleWebhookEvent(event);

    return { received: true };
  }
}
