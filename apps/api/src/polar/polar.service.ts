import { Injectable, Logger, ServiceUnavailableException } from "@nestjs/common";
import { Polar } from "@polar-sh/sdk";
import type { Subscription } from "@polar-sh/sdk/models/components/subscription.js";
import type { WebhookSubscriptionActivePayload } from "@polar-sh/sdk/models/components/webhooksubscriptionactivepayload.js";
import { isDeployedEnvironment } from "../common/environment";
import type { PlanTier } from "../generated/prisma/enums";
import { CreditsService } from "../credits/credits.service";
import { PrismaService } from "../prisma/prisma.service";
import type { SubscribableTier } from "./dto/create-checkout.dto";
import { getPolarServer, polarRequestOptions, type PolarServer } from "./polar.config";

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
  readonly checkoutEnvironment: PolarServer;
  private readonly productIdByTier: Record<SubscribableTier, string | undefined>;
  private readonly tierByProductId: Map<string, SubscribableTier>;

  constructor(
    private readonly prisma: PrismaService,
    private readonly creditsService: CreditsService,
  ) {
    this.checkoutEnvironment = getPolarServer();
    this.client = new Polar({
      accessToken: process.env.POLAR_ACCESS_TOKEN,
      server: this.checkoutEnvironment,
    });

    if (
      isDeployedEnvironment() &&
      process.env.POLAR_SERVER?.trim().toLowerCase() === "sandbox" &&
      this.checkoutEnvironment === "production"
    ) {
      this.logger.warn(
        "Ignoring POLAR_SERVER=sandbox on a deployment; using Polar production. " +
          "Set ALLOW_POLAR_SANDBOX_ON_DEPLOYMENT=true only for intentional staging.",
      );
    }

    if (isDeployedEnvironment() && process.env.DEV_SKIP_PAYMENT === "true") {
      this.logger.warn("Ignoring DEV_SKIP_PAYMENT=true on a deployment");
    }

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
    this.assertAccessTokenConfigured();

    const productId = this.productIdByTier[tier];
    if (!productId) {
      throw new Error(`No Polar product id configured for tier ${tier} (check .env)`);
    }

    const frontendUrl = (process.env.FRONTEND_URL ?? "http://localhost:3000").replace(/\/+$/, "");

    let checkout;
    try {
      checkout = await this.client.checkouts.create(
        {
          products: [productId],
          customerEmail: user.email,
          // First-class field for cross-system identity — read back as
          // subscription.customer.externalId in the webhook handler below.
          externalCustomerId: user.id,
          successUrl: `${frontendUrl}/billing/success?checkout_id={CHECKOUT_ID}`,
          // Belt-and-suspenders: also copied onto the resulting subscription's
          // metadata, in case externalCustomerId is ever unavailable.
          metadata: { userId: user.id },
        },
        polarRequestOptions(),
      );
    } catch (error) {
      this.logger.error(
        `Polar ${this.checkoutEnvironment} checkout creation failed: ${this.describeError(error)}`,
      );
      throw new ServiceUnavailableException(
        "Payment checkout is temporarily unavailable. Please try again shortly.",
      );
    }

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
   * Verifies a completed checkout directly against the Polar API and grants
   * the plan — an alternative to `handleWebhookEvent` for setups that don't
   * want to stand up a webhook endpoint. Only needs POLAR_ACCESS_TOKEN (no
   * webhook secret), since it pulls the checkout's state instead of trusting
   * a pushed event. Called from the success-page redirect, so it's driven by
   * `checkout_id` rather than a signed payload — the ownership check below is
   * what stops one user from claiming another's checkout by guessing its id.
   */
  async verifyAndGrantCheckout(checkoutId: string, user: { id: string; email: string }): Promise<SubscribableTier> {
    this.assertAccessTokenConfigured();
    const checkout = await this.client.checkouts.get(
      { id: checkoutId },
      polarRequestOptions(),
    );

    if (checkout.status !== "succeeded") {
      throw new Error(`Checkout has not completed yet (status: ${checkout.status})`);
    }

    const tier = checkout.productId ? this.tierByProductId.get(checkout.productId) : undefined;
    if (!tier) {
      throw new Error("Checkout is for an unrecognized product");
    }

    const belongsToUser =
      checkout.externalCustomerId === user.id ||
      checkout.customerEmail?.toLowerCase() === user.email.toLowerCase() ||
      (checkout.metadata?.userId as string | undefined) === user.id;
    if (!belongsToUser) {
      throw new Error("This checkout does not belong to the signed-in user");
    }

    const dbUser = await this.prisma.user.findUnique({ where: { id: user.id } });
    if (dbUser?.polarSubscriptionId && checkout.subscriptionId === dbUser.polarSubscriptionId) {
      // Already granted — e.g. the success page was reloaded. Avoid double-crediting.
      return tier;
    }

    await this.applyPlanUpgrade(
      user.id,
      tier,
      checkout.customerId && checkout.subscriptionId
        ? { polarCustomerId: checkout.customerId, polarSubscriptionId: checkout.subscriptionId }
        : undefined,
    );

    return tier;
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

  private assertAccessTokenConfigured(): void {
    const accessToken = process.env.POLAR_ACCESS_TOKEN?.trim();
    if (
      accessToken &&
      !accessToken.startsWith("polar_ci_") &&
      !accessToken.startsWith("polar_cs_")
    ) {
      return;
    }

    if (
      accessToken?.startsWith("polar_ci_") ||
      accessToken?.startsWith("polar_cs_") ||
      process.env.POLAR_CLIENT_ID ||
      process.env.POLAR_CLIENT_SECRET
    ) {
      throw new Error(
        "Polar OAuth client credentials cannot authorize checkout requests. " +
          "Create a production Organization Access Token and set it as POLAR_ACCESS_TOKEN.",
      );
    }

    throw new Error(
      "POLAR_ACCESS_TOKEN is not configured. Create a production Organization Access Token in Polar.",
    );
  }

  private describeError(error: unknown): string {
    if (!(error instanceof Error)) {
      return String(error);
    }

    const statusCode = (error as Error & { statusCode?: number }).statusCode;
    return `${error.name}${statusCode ? ` (${statusCode})` : ""}: ${error.message}`;
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
