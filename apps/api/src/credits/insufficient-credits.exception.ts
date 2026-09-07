import { BadRequestException } from "@nestjs/common";

export class InsufficientCreditsException extends BadRequestException {
  constructor() {
    super("Insufficient credit balance");
  }
}
