import { IsIn, IsString, MaxLength, MinLength } from "class-validator";

export class EnhancePromptDto {
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  prompt!: string;

  @IsIn(["enhance", "variation"])
  mode!: "enhance" | "variation";

  @IsIn(["IMAGE", "VIDEO"])
  type!: "IMAGE" | "VIDEO";
}
