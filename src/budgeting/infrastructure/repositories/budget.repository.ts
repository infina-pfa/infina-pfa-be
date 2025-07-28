import { BudgetEntity, BudgetRepository } from '@/budgeting/domain';
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
}
