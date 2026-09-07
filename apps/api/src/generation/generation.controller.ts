import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import type { AuthenticatedUser } from "../auth/types/authenticated-user.interface";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { GenerateDto } from "./dto/generate.dto";
import { HistoryQueryDto } from "./dto/history-query.dto";
import { GenerationService } from "./generation.service";

@Controller()
export class GenerationController {
  constructor(private readonly generationService: GenerationService) {}

  @Post("generate")
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: GenerateDto) {
    return this.generationService.create(user.id, dto);
  }

  @Get("generation/:id")
  findOne(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.generationService.findOne(user.id, id);
  }

  @Get("history")
  history(@CurrentUser() user: AuthenticatedUser, @Query() query: HistoryQueryDto) {
    return this.generationService.history(user.id, query.page ?? 1, query.limit ?? 20);
  }
}
