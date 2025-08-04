import { TransactionEntity, TransactionRepository } from '@/budgeting/domain';
import { PrismaClient } from '@/common/prisma/prisma-client';
import { TransactionPrismaRepository } from '@/common/prisma';
import { TransactionORM } from '@/common/types/orms';
import { FindManyOptions } from '@/common/types/query.types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TransactionRepositoryImpl
  extends TransactionPrismaRepository
  implements TransactionRepository
{
  constructor(private readonly prismaClient: PrismaClient) {
    super(prismaClient.transactions);
  }

  async findManyByMonth(
    props: Partial<TransactionEntity['props']>,
    options?: FindManyOptions & { month: number; year: number },
  ): Promise<TransactionEntity[]> {
    if (options?.month === 0 || options?.year === 0) {
      return [];
    }

    const transactions: TransactionORM[] = await this.prismaDelegate.findMany({
      where: {
        ...props,
        ...(options
          ? {
              createdAt: {
                gte: new Date(options.year, options.month - 1, 1),
                lte: new Date(options.year, options.month, 0),
              },
            }
          : {}),
      },
    });

    return transactions.map((transaction) => this.toEntity(transaction));
  }

  async findBudgetSpendingByMonth(
    userId: string,
    month: number,
    year: number,
  ): Promise<TransactionEntity[]> {
    if (month < 1 || month > 12 || year <= 0) {
      return [];
    }

    // Query through budget_transactions junction table with proper include
    const budgetTransactions =
      await this.prismaClient.budget_transactions.findMany({
        where: {
          user_id: userId,
        },
        include: {
          transactions: true,
        },
      });

    // Filter transactions for outcome type and date range, then extract the transaction data
    const transactions: TransactionORM[] = budgetTransactions
      .map((bt) => bt.transactions)
      .filter((transaction) => {
        if (!transaction) return false;

        // Filter for outcome type only
        if (transaction.type !== 'outcome') return false;

        // Filter by date range
        const transactionDate = new Date(transaction.created_at);
        const startOfMonth = new Date(year, month - 1, 1);
        const endOfMonth = new Date(year, month, 0);

        return transactionDate >= startOfMonth && transactionDate <= endOfMonth;
      });

    return transactions.map((transaction) => this.toEntity(transaction));
  }
}
