import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { Throttle, seconds } from "@nestjs/throttler";
import type { AuthenticatedUser } from "../auth/types/authenticated-user.interface";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { EnhancePromptDto } from "./dto/enhance-prompt.dto";
import { GenerateDto } from "./dto/generate.dto";
import { HistoryQueryDto } from "./dto/history-query.dto";
import { GenerationService } from "./generation.service";

const ENHANCE_THROTTLE = { default: { limit: 20, ttl: seconds(60) } };

@Controller()
export class GenerationController {
  constructor(private readonly generationService: GenerationService) {}

  @Post("generate")
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: GenerateDto) {
    return this.generationService.create(user, dto);
  }

  @Get("history")
  history(@CurrentUser() user: AuthenticatedUser, @Query() query: HistoryQueryDto) {
    return this.generationService.history(user.id, query.page ?? 1, query.limit ?? 20);
  }

  // Static "models"/"enhance" segments must be registered before the
  // "generation/:id" wildcard route below, or they'd be swallowed as an :id.
  @Get("generation/models")
  models(@CurrentUser() user: AuthenticatedUser) {
    return this.generationService.getModels(user.plan);
  }

  @Throttle(ENHANCE_THROTTLE)
  @Post("generation/enhance")
  enhance(@CurrentUser() user: AuthenticatedUser, @Body() dto: EnhancePromptDto) {
    return this.generationService.enhancePrompt(user, dto);
  }

  @Get("generation/:id")
  findOne(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.generationService.findOne(user.id, id);
  }
}
