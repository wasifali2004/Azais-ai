import { Module } from "@nestjs/common";
import { RunwareService } from "./runware.service";

@Module({
  providers: [RunwareService],
  exports: [RunwareService],
})
export class RunwareModule {}
