import { IsEmail, Matches, MaxLength } from "class-validator";

export class VerifyEmailDto {
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @Matches(/^\d{6}$/, { message: "code must be a 6-digit number" })
  code!: string;
}
