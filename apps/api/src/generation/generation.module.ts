import { Module } from "@nestjs/common";
import { CreditsModule } from "../credits/credits.module";
import { GeminiModule } from "../gemini/gemini.module";
import { StorageModule } from "../storage/storage.module";
import { GenerationController } from "./generation.controller";
import { GenerationService } from "./generation.service";

@Module({
  imports: [CreditsModule, GeminiModule, StorageModule],
  controllers: [GenerationController],
  providers: [GenerationService],
})
export class GenerationModule {}
