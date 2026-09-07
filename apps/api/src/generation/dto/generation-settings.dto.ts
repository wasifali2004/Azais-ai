import { IsIn, IsOptional } from "class-validator";
import { ALLOWED_ASPECT_RATIOS, ALLOWED_VIDEO_DURATIONS } from "../model-catalog";

export class GenerationSettingsDto {
  @IsOptional()
  @IsIn(ALLOWED_ASPECT_RATIOS)
  aspectRatio?: string;

  @IsOptional()
  @IsIn(ALLOWED_VIDEO_DURATIONS)
  durationSeconds?: number;
}
