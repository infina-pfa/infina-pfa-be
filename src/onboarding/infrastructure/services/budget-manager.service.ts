import { PrismaClient } from '@/common/prisma';
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
}
