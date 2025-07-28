import { TransactionEntity, TransactionRepository } from '@/budgeting/domain';
import { PrismaClient } from '@/common';
import { TransactionPrismaRepository } from '@/common/repositories';
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
}
