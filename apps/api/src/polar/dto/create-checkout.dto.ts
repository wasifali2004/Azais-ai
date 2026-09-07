import { IsIn } from "class-validator";

const SUBSCRIBABLE_TIERS = ["STARTER", "PRO", "BUSINESS"] as const;
export type SubscribableTier = (typeof SUBSCRIBABLE_TIERS)[number];

export class CreateCheckoutDto {
  @IsIn(SUBSCRIBABLE_TIERS)
  tier!: SubscribableTier;
}
