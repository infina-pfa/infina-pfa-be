import {
  IncomeAggregate,
  IncomeRepository,
  TransactionType,
} from '@/budgeting/domain';
import { TransactionsWatchList } from '@/budgeting/domain/watch-list/transactions.watch-list';
import { TransactionPrismaRepository } from '@/common/prisma';
import { PrismaClient } from '@/common/prisma/prisma-client';
import { Injectable } from '@nestjs/common';

@Injectable()
export class IncomeRepositoryImpl
  extends TransactionPrismaRepository
  implements IncomeRepository
{
  constructor(private readonly prismaClient: PrismaClient) {
    super(prismaClient.transactions);
  }

  async add(income: IncomeAggregate): Promise<void> {
    await this.prismaClient.transactions.createMany({
      data: income.props.transactions.addedItems.map((transaction) =>
        this.toORM(transaction),
      ),
    });
  }

  async remove(income: IncomeAggregate): Promise<void> {
    await this.prismaClient.transactions.deleteMany({
      where: {
        id: {
          in: income.props.transactions.removedItems.map(
            (transaction) => transaction.id,
          ),
        },
      },
    });
  }

  async findByMonth(
    userId: string,
    month: number,
    year: number,
  ): Promise<IncomeAggregate | null> {
    console.log('🚀 ~ IncomeRepositoryImpl ~ findByMonth ~ userId:', userId);
    console.log('🚀 ~ IncomeRepositoryImpl ~ findByMonth ~ month:', month);
    console.log('🚀 ~ IncomeRepositoryImpl ~ findByMonth ~ year:', year);
    if (month < 1 || month > 12 || year <= 0) {
      return null;
    }

    const incomeTransactions = await this.prismaClient.transactions.findMany({
      where: {
        user_id: userId,
        type: TransactionType.INCOME,
        created_at: {
          gte: new Date(year, month - 1, 1),
          lte: new Date(year, month, 0),
        },
      },
    });

    return IncomeAggregate.create({
      userId,
      transactions: new TransactionsWatchList(
        incomeTransactions.map((incomeTransaction) =>
          this.toEntity(incomeTransaction),
        ),
      ),
    });
  }
}
