import { Body, Controller, Get, Post } from "@nestjs/common";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Public } from "../common/decorators/public.decorator";
import type { AuthenticatedUser } from "../auth/types/authenticated-user.interface";
import { CreateCheckoutDto } from "./dto/create-checkout.dto";
import { PolarService } from "./polar.service";

function isDevSkipPaymentEnabled(): boolean {
  return process.env.DEV_SKIP_PAYMENT === "true";
}

@Controller("billing")
export class BillingController {
  constructor(private readonly polarService: PolarService) {}

  /**
   * Public so the frontend can show a "test mode" banner before the user
   * even logs in. Never exposes anything beyond this boolean.
   */
  @Public()
  @Get("config")
  getConfig() {
    return { devSkipPayment: isDevSkipPaymentEnabled() };
  }

  /** Requires a valid JWT (global guard) — not marked @Public(). */
  @Post("checkout")
  async createCheckout(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateCheckoutDto) {
    const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:3000";

    if (isDevSkipPaymentEnabled()) {
      // DEV-ONLY BYPASS: no real Polar API call, no real payment. See
      // PolarService.simulateSuccessfulCheckout and the README's
      // "Known limitations / dev shortcuts" section.
      await this.polarService.simulateSuccessfulCheckout(user.id, dto.tier);
      return { url: `${frontendUrl}/billing/success?dev=1&tier=${dto.tier}` };
    }

    const url = await this.polarService.createCheckoutSession(user, dto.tier);
    return { url };
  }
}
