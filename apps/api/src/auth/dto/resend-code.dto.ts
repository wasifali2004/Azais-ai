import { IsEmail, MaxLength } from "class-validator";

export class ResendCodeDto {
  @IsEmail()
  @MaxLength(255)
  email!: string;
}
