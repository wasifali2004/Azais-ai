import { Injectable, Logger } from "@nestjs/common";
import { Polar } from "@polar-sh/sdk";
import type { Subscription } from "@polar-sh/sdk/models/components/subscription.js";
import type { WebhookSubscriptionActivePayload } from "@polar-sh/sdk/models/components/webhooksubscriptionactivepayload.js";
import type { PlanTier } from "../generated/prisma/enums";
import { CreditsService } from "../credits/credits.service";
import { PrismaService } from "../prisma/prisma.service";
import type { SubscribableTier } from "./dto/create-checkout.dto";

/** Only paid tiers have a Polar product and a row in the `Plan` table. */
const PLAN_NAME_BY_TIER: Record<SubscribableTier, string> = {
  STARTER: "Starter",
  PRO: "Pro",
  BUSINESS: "Business",
};

@Injectable()
export class PolarService {
  private readonly logger = new Logger(PolarService.name);
  private readonly client: Polar;
  private readonly productIdByTier: Record<SubscribableTier, string | undefined>;
  private readonly tierByProductId: Map<string, SubscribableTier>;

  constructor(
    private readonly prisma: PrismaService,
    private readonly creditsService: CreditsService,
  ) {
    this.client = new Polar({
      accessToken: process.env.POLAR_ACCESS_TOKEN,
      server: process.env.POLAR_SERVER === "production" ? "production" : "sandbox",
    });

    this.productIdByTier = {
      STARTER: process.env.POLAR_STARTER_PRODUCT_ID,
      PRO: process.env.POLAR_PRO_PRODUCT_ID,
      BUSINESS: process.env.POLAR_BUSINESS_PRODUCT_ID,
    };

    this.tierByProductId = new Map(
      (Object.entries(this.productIdByTier) as [SubscribableTier, string | undefined][])
        .filter((entry): entry is [SubscribableTier, string] => Boolean(entry[1]))
        .map(([tier, productId]) => [productId, tier]),
    );
  }

  /** Creates a Polar checkout session and returns its hosted URL. */
  async createCheckoutSession(
    user: { id: string; email: string },
    tier: SubscribableTier,
  ): Promise<string> {
    const productId = this.productIdByTier[tier];
    if (!productId) {
      throw new Error(`No Polar product id configured for tier ${tier} (check .env)`);
    }

    const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:3000";

    const checkout = await this.client.checkouts.create({
      products: [productId],
      customerEmail: user.email,
      // First-class field for cross-system identity — read back as
      // subscription.customer.externalId in the webhook handler below.
      externalCustomerId: user.id,
      successUrl: `${frontendUrl}/billing/success?checkout_id={CHECKOUT_ID}`,
      // Belt-and-suspenders: also copied onto the resulting subscription's
      // metadata, in case externalCustomerId is ever unavailable.
      metadata: { userId: user.id },
    });

    return checkout.url;
  }

  /**
   * Handles an already-signature-verified webhook event. Only
   * `subscription.active` is acted on: `subscription.created` can fire
   * before the first payment is confirmed, per Polar's own docs.
   */
  async handleWebhookEvent(event: { type: string; data: unknown }): Promise<void> {
    if (event.type !== "subscription.active") {
      return;
    }

    await this.grantSubscription(
      (event as WebhookSubscriptionActivePayload).data,
    );
  }

  private async grantSubscription(subscription: Subscription): Promise<void> {
    const tier = this.tierByProductId.get(subscription.productId);
    if (!tier) {
      this.logger.warn(
        `Ignoring subscription ${subscription.id}: unrecognized Polar product id ${subscription.productId}`,
      );
      return;
    }

    const userId = subscription.customer.externalId ?? (subscription.metadata.userId as string | undefined);
    const user = userId
      ? await this.prisma.user.findUnique({ where: { id: userId } })
      : subscription.customer.email
        ? await this.prisma.user.findUnique({ where: { email: subscription.customer.email } })
        : null;

    if (!user) {
      this.logger.error(
        `Could not match Polar subscription ${subscription.id} to a User ` +
          `(externalId=${userId ?? "none"}, email=${subscription.customer.email ?? "none"})`,
      );
      return;
    }

    if (user.polarSubscriptionId === subscription.id) {
      // Webhook redelivery for a subscription we've already processed —
      // applying it again would double-grant this period's credits.
      return;
    }

    await this.applyPlanUpgrade(user.id, tier, {
      polarCustomerId: subscription.customerId,
      polarSubscriptionId: subscription.id,
    });
  }

  /**
   * DEV-ONLY BYPASS. Applies exactly what a verified `subscription.active`
   * webhook would apply, but synchronously and without any real Polar
   * checkout/payment — for demoing the product without real Polar
   * credentials. Gated by DEV_SKIP_PAYMENT; never call this outside that
   * check. Does not touch polarCustomerId/polarSubscriptionId, since no real
   * Polar subscription exists to record.
   */
  async simulateSuccessfulCheckout(userId: string, tier: SubscribableTier): Promise<void> {
    this.logger.warn(
      `DEV_SKIP_PAYMENT bypass: granting ${tier} to user ${userId} with no real Polar payment`,
    );
    await this.applyPlanUpgrade(userId, tier);
  }

  private async applyPlanUpgrade(
    userId: string,
    tier: SubscribableTier,
    polarIds?: { polarCustomerId: string; polarSubscriptionId: string },
  ): Promise<void> {
    const plan = await this.prisma.plan.findUnique({
      where: { name: PLAN_NAME_BY_TIER[tier] },
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        plan: tier as PlanTier,
        ...polarIds,
      },
    });

    if (plan) {
      await this.creditsService.credit(userId, plan.monthlyCredits, "SUBSCRIPTION_RENEWAL");
    } else {
      this.logger.warn(
        `No Plan row named "${PLAN_NAME_BY_TIER[tier]}" — plan tier updated but no credits granted`,
      );
    }
  }
}
