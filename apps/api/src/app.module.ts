import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { HealthModule } from "./health/health.module";
import { EmailModule } from "./email/email.module";

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), HealthModule, EmailModule],
})
export class AppModule {}
