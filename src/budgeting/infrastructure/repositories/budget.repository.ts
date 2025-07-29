import {
  BudgetEntity,
  BudgetRepository,
  BudgetWithSpendingData,
} from '@/budgeting/domain';
import { PrismaClient } from '@/common';
import { BudgetPrismaRepository } from '@/common/repositories';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BudgetRepositoryImpl
  extends BudgetPrismaRepository
  implements BudgetRepository
{
  constructor(private readonly prismaClient: PrismaClient) {
    super(prismaClient);
  }

  async findManyByMonth(
    userId: string,
    month: number,
    year: number,
  ): Promise<BudgetEntity[]> {
    if (month === 0 || year === 0) {
      return [];
    }

    const budgets = await this.prismaClient.budgets.findMany({
      where: {
        user_id: userId,
        created_at: {
          gte: new Date(year, month - 1, 1),
          lte: new Date(year, month, 0),
        },
      },
    });

    return budgets.map((budget) => this.toEntity(budget));
  }

  async findManyWithSpending(
    userId: string,
    month: number,
    year: number,
  ): Promise<BudgetWithSpendingData[]> {
    if (month === 0 || year === 0) {
      return [];
    }

    // Single optimized query using existing indexes
    const budgetsWithSpending = await this.prismaClient.budgets.findMany({
      where: {
        user_id: userId,
        month,
        year,
      },
      include: {
        budget_transactions: {
          include: {
            transactions: {
              select: {
                amount: true,
              },
            },
          },
        },
      },
    });

    return budgetsWithSpending.map((budgetData) => {
      const budget = this.toEntity(budgetData);

      // Calculate spending metrics
      let totalSpent = 0;
      let transactionCount = 0;

      if (budgetData.budget_transactions) {
        budgetData.budget_transactions.forEach((bt) => {
          if (bt.transactions) {
            totalSpent += Number(bt.transactions.amount);
            transactionCount++;
          }
        });
      }

      return {
        budget,
        totalSpent,
        transactionCount,
      };
    });
  }
}
