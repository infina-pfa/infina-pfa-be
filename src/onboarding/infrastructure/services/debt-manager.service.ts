import { PrismaClient } from '@/common/prisma';
import { DebtManagerService, CreateDebtProps } from '@/onboarding/domain';

import { Injectable } from '@nestjs/common';

@Injectable()
export class DebtManagerServiceImpl implements DebtManagerService {
  constructor(private readonly prisma: PrismaClient) {}

  async createDebts(userId: string, debts: CreateDebtProps[]): Promise<void> {
    await this.prisma.debts.createMany({
      data: debts.map((debt) => ({
        lender: debt.lender,
        purpose: debt.purpose,
        amount: debt.amount.value,
        rate: debt.rate,
        due_date: debt.dueDate,
        type: debt.type,
        user_id: userId,
      })),
    });
  }
}
