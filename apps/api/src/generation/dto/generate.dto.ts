import { Type } from "class-transformer";
import { IsIn, IsOptional, IsString, MaxLength, MinLength, ValidateNested } from "class-validator";
import { GenerationSettingsDto } from "./generation-settings.dto";

export class GenerateDto {
  @IsIn(["IMAGE", "VIDEO"])
  type!: "IMAGE" | "VIDEO";

  @IsString()
  @MaxLength(64)
  model!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  prompt!: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => GenerationSettingsDto)
  settings?: GenerationSettingsDto;
}
