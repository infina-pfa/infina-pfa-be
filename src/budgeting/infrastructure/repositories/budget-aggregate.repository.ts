import {
  BudgetAggregate,
  BudgetAggregateRepository,
  BudgetEntityProps,
  BudgetRepository,
  TransactionRepository,
} from '@/budgeting/domain';
import { TransactionsWatchList } from '@/budgeting/domain/watch-list/transactions.watch-list';
import { PrismaClient } from '@/common/prisma/prisma-client';
import { BudgetORM, TransactionORM } from '@/common/types/orms';
import { FindManyOptions } from '@/common/types/query.types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BudgetAggregateRepositoryImpl
  implements BudgetAggregateRepository
{
  constructor(
    private readonly prismaClient: PrismaClient,
    private readonly budgetRepository: BudgetRepository,
    private readonly transactionRepository: TransactionRepository,
  ) {}

  toEntity(data: {
    id: string;
    budget: BudgetORM;
    spending: TransactionORM[];
  }): BudgetAggregate {
    return BudgetAggregate.create(
      {
        budget: this.budgetRepository.toEntity(data.budget),
        spending: new TransactionsWatchList(
          data.spending.map((transaction) =>
            this.transactionRepository.toEntity(transaction),
          ),
        ),
        createdAt: data.budget.created_at,
        updatedAt: data.budget.updated_at,
      },
      data.id,
    );
  }

  toORM(entity: BudgetAggregate): {
    budget: BudgetORM;
    spending: TransactionORM[];
  } {
    return {
      budget: this.budgetRepository.toORM(entity.props.budget) as BudgetORM,
      spending: entity.props.spending.items.map(
        (transaction) =>
          this.transactionRepository.toORM(transaction) as TransactionORM,
      ),
    };
  }

  async save(entity: BudgetAggregate): Promise<void> {
    const budgetORM = this.toORM(entity);

    return this.prismaClient.$transaction(async (tx) => {
      // 1. Update budget
      await tx.budgets.update({
        where: { id: entity.id },
        data: {
          ...budgetORM.budget,
          updated_at: new Date(),
        },
      });

      // 2. Handle added transactions
      for (const transaction of budgetORM.spending) {
        // Create transaction if not exists
        const createdTransaction = await tx.transactions.upsert({
          where: { id: transaction.id },
          create: transaction,
          update: transaction,
        });

        // Link to budget
        await tx.budget_transactions.create({
          data: {
            budget_id: entity.id,
            transaction_id: createdTransaction.id,
            user_id: entity.props.budget.userId,
          },
        });
      }

      // 3. Handle updated transactions
      for (const transaction of budgetORM.spending) {
        await tx.transactions.update({
          where: { id: transaction.id },
          data: transaction,
        });
      }

      // 4. Handle removed transactions
      for (const transaction of budgetORM.spending) {
        await tx.budget_transactions.deleteMany({
          where: {
            budget_id: entity.id,
            transaction_id: transaction.id,
          },
        });
      }
    });
  }

  async findById(id: string): Promise<BudgetAggregate | null> {
    const budgetORM = await this.prismaClient.budgets.findUnique({
      where: { id },
      include: {
        budget_transactions: { include: { transactions: true } },
      },
    });

    if (!budgetORM) return null;

    return this.toEntity({
      id,
      budget: budgetORM,
      spending: budgetORM.budget_transactions.map(
        (transaction) => transaction.transactions,
      ),
    });
  }

  async findOne(
    props: Partial<Readonly<BudgetEntityProps>>,
  ): Promise<BudgetAggregate | null> {
    const budgetORM = await this.prismaClient.budgets.findFirst({
      where: {
        ...props,
        amount: props.amount?.value,
      },
      include: {
        budget_transactions: { include: { transactions: true } },
      },
    });

    if (!budgetORM) return null;

    return this.toEntity({
      id: budgetORM.id,
      budget: budgetORM,
      spending: budgetORM.budget_transactions.map(
        (transaction) => transaction.transactions,
      ),
    });
  }

  async findMany(
    props: Partial<Readonly<BudgetEntityProps>>,
    options?: FindManyOptions,
  ): Promise<BudgetAggregate[]> {
    const budgetORMs = await this.prismaClient.budgets.findMany({
      where: {
        ...props,
        amount: props.amount?.value,
      },
      include: {
        budget_transactions: { include: { transactions: true } },
      },
      take: options?.pagination?.limit,
      skip: options?.pagination?.page,
      orderBy: options?.sort?.map((sort) => ({
        [sort.field]: sort.direction,
      })),
    });

    return budgetORMs.map((budgetORM) =>
      this.toEntity({
        id: budgetORM.id,
        budget: budgetORM,
        spending: budgetORM.budget_transactions.map(
          (transaction) => transaction.transactions,
        ),
      }),
    );
  }
}
