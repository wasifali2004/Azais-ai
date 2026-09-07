import { Controller, Get } from "@nestjs/common";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../auth/types/authenticated-user.interface";
import { CreditsService } from "./credits.service";

@Controller("credits")
export class CreditsController {
  constructor(private readonly creditsService: CreditsService) {}

  @Get("balance")
  async getBalance(@CurrentUser() user: AuthenticatedUser) {
    const balance = await this.creditsService.getBalance(user.id);
    return { balance };
  }
}
