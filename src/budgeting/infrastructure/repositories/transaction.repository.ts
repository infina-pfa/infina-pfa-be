import {
  BudgetRepository,
  BudgetTransaction,
  TransactionEntity,
  TransactionRepository,
} from '@/budgeting/domain';
import { TransactionPrismaRepository } from '@/common/prisma';
import { PrismaClient } from '@/common/prisma/prisma-client';
import { TransactionType } from '@/common/types/transaction';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TransactionRepositoryImpl
  extends TransactionPrismaRepository
  implements TransactionRepository
{
  constructor(
    protected readonly prismaClient: PrismaClient,
    private readonly budgetRepository: BudgetRepository,
  ) {
    super(prismaClient);
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
  ): Promise<BudgetTransaction[]> {
    if (month < 1 || month > 12 || year <= 0) {
      return [];
    }

    // Query through budget_transactions junction table with proper filtering
    const budgetTransactions = await this.prismaClient.transactions.findMany({
      where: {
        user_id: userId,
        type: TransactionType.BUDGET_SPENDING,
        created_at: {
          gte: new Date(year, month - 1, 1), // Start of the month
          lte: new Date(year, month, 0), // End of the month
        },
      },
      include: {
        budget_transactions: {
          include: {
            budgets: true,
          },
        },
      },
    });

    return budgetTransactions.map((budgetTransaction) => {
      return {
        transaction: this.toEntity(budgetTransaction),
        budget: this.budgetRepository.toEntity(
          budgetTransaction.budget_transactions[0].budgets,
        ),
      };
    });
  }
}
