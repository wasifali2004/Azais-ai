import { IsIn, IsInt, IsOptional, Min } from "class-validator";
import { ALLOWED_ASPECT_RATIOS } from "../model-catalog";

export class GenerationSettingsDto {
  @IsOptional()
  @IsIn(ALLOWED_ASPECT_RATIOS)
  aspectRatio?: string;

  // Range is model-specific — validated against the chosen model's own
  // catalog entry in GenerationService (see validateSettings()), not here.
  @IsOptional()
  @IsInt()
  @Min(1)
  durationSeconds?: number;
}
