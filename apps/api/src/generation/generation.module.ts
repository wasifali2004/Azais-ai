import { Module } from "@nestjs/common";
import { CreditsModule } from "../credits/credits.module";
import { GeminiModule } from "../gemini/gemini.module";
import { RunwareModule } from "../runware/runware.module";
import { StorageModule } from "../storage/storage.module";
import { GenerationController } from "./generation.controller";
import { GenerationService } from "./generation.service";

@Module({
  imports: [CreditsModule, GeminiModule, RunwareModule, StorageModule],
  controllers: [GenerationController],
  providers: [GenerationService],
})
export class GenerationModule {}
