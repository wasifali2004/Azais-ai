import { Module } from "@nestjs/common";
import { CreditsModule } from "../credits/credits.module";
import { BillingController } from "./billing.controller";
import { PolarWebhookController } from "./polar-webhook.controller";
import { PolarService } from "./polar.service";

@Module({
  imports: [CreditsModule],
  controllers: [PolarWebhookController, BillingController],
  providers: [PolarService],
})
export class PolarModule {}
