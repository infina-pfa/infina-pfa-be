import {
  TransactionEntity,
  TransactionRepository,
  TransactionType,
} from '@/budgeting/domain';
import { TransactionPrismaRepository } from '@/common/prisma';
import { PrismaClient } from '@/common/prisma/prisma-client';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TransactionRepositoryImpl
  extends TransactionPrismaRepository
  implements TransactionRepository
{
  constructor(private readonly prismaClient: PrismaClient) {
    super(prismaClient.transactions);
  }

  override async delete(entity: TransactionEntity): Promise<void> {
    await this.prismaClient.$transaction(async (tx) => {
      await Promise.all([
        tx.budget_transactions.deleteMany({
          where: {
            transaction_id: entity.id,
          },
        }),
        tx.transactions.delete({
          where: { id: entity.id },
        }),
      ]);
    });
  }

  async findBudgetSpendingByMonth(
    userId: string,
    month: number,
    year: number,
  ): Promise<TransactionEntity[]> {
    if (month < 1 || month > 12 || year <= 0) {
      return [];
    }

    // Query through budget_transactions junction table with proper filtering
    const budgetTransactions =
      await this.prismaClient.budget_transactions.findMany({
        where: {
          user_id: userId,
          transactions: {
            type: TransactionType.BUDGET_SPENDING, // Only spending transactions
            created_at: {
              gte: new Date(year, month - 1, 1), // Start of the month
              lte: new Date(year, month, 0), // End of the month
            },
          },
        },
        include: {
          transactions: true,
        },
      });

    // Filter out null transactions and convert to entities
    // Database query already filters by type and date, so we just need to handle nulls
    return budgetTransactions
      .filter((bt) => bt.transactions !== null)
      .map((budgetTransaction) =>
        this.toEntity(budgetTransaction.transactions),
      );
  }
}
