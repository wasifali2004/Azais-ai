import { Injectable } from "@nestjs/common";
import type { CreditReason } from "../../generated/prisma/enums";
import { PrismaService } from "../prisma/prisma.service";
import { InsufficientCreditsException } from "./insufficient-credits.exception";

interface CreditOptions {
  generationId?: string;
}

@Injectable()
export class CreditsService {
  constructor(private readonly prisma: PrismaService) {}

  async getBalance(userId: string): Promise<number> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { creditBalance: true },
    });
    return user.creditBalance;
  }

  /**
   * Atomically deducts `amount` credits and writes the ledger row in one
   * transaction. The balance check happens inside the same conditional
   * UPDATE (`creditBalance >= amount`) so a balance can never go negative,
   * even under concurrent debits for the same user.
   */
  async debit(userId: string, amount: number, reason: CreditReason, opts?: CreditOptions) {
    if (amount <= 0) {
      throw new Error("debit amount must be positive");
    }

    return this.prisma.$transaction(async (tx) => {
      const result = await tx.user.updateMany({
        where: { id: userId, creditBalance: { gte: amount } },
        data: { creditBalance: { decrement: amount } },
      });

      if (result.count === 0) {
        throw new InsufficientCreditsException();
      }

      return tx.creditTransaction.create({
        data: {
          userId,
          amount: -amount,
          reason,
          generationId: opts?.generationId,
        },
      });
    });
  }

  /** Atomically grants `amount` credits and writes the ledger row. */
  async credit(userId: string, amount: number, reason: CreditReason, opts?: CreditOptions) {
    if (amount <= 0) {
      throw new Error("credit amount must be positive");
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { creditBalance: { increment: amount } },
      });

      return tx.creditTransaction.create({
        data: {
          userId,
          amount,
          reason,
          generationId: opts?.generationId,
        },
      });
    });
  }
}
