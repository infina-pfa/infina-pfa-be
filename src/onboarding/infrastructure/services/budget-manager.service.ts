import { CurrencyVO } from '@/common/base';
import { PrismaClient } from '@/common/prisma';
import { TransactionType } from '@/common/types/transaction';
import { BudgetManagerService, CreateBudgetProps } from '@/onboarding/domain';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BudgetManagerServiceImpl implements BudgetManagerService {
  constructor(private readonly prisma: PrismaClient) {}

  async createBudgets(
    userId: string,
    budgets: CreateBudgetProps[],
  ): Promise<void> {
    await this.prisma.budgets.createMany({
      data: budgets.map((budget) => ({
        ...budget,
        user_id: userId,
        amount: budget.amount.value,
      })),
    });
  }

  async createIncome(userId: string, amount: CurrencyVO): Promise<void> {
    await this.prisma.transactions.create({
      data: {
        user_id: userId,
        amount: amount.value,
        name: 'Thu nhập',
        type: TransactionType.INCOME,
        recurring: 0,
        description: 'Thu nhập đầu tiên',
      },
    });
  }
}
