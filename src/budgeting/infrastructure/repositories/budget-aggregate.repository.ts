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
      },
      data.id,
    );
  }

  toORM(entity: BudgetAggregate): {
    budget: BudgetORM;
  } {
    return {
      budget: this.budgetRepository.toORM(entity.props.budget) as BudgetORM,
    };
  }

  async save(entity: BudgetAggregate): Promise<void> {
    const budgetORM = this.toORM(entity);
    const addedSpendingORM = entity.props.spending.addedItems.map(
      (transaction) =>
        this.transactionRepository.toORM(transaction) as TransactionORM,
    );
    const updatedSpendingORM = entity.props.spending.updatedItems.map(
      (transaction) =>
        this.transactionRepository.toORM(transaction) as TransactionORM,
    );
    const removedSpendingORM = entity.props.spending.removedItems.map(
      (transaction) =>
        this.transactionRepository.toORM(transaction) as TransactionORM,
    );

    return this.prismaClient.$transaction(async (tx) => {
      // 1. Upsert budget
      await tx.budgets.upsert({
        where: { id: entity.id },
        create: {
          ...budgetORM.budget,
        },
        update: {
          ...budgetORM.budget,
          updated_at: new Date(),
        },
      });

      // 2. Handle added transactions
      for (const transaction of addedSpendingORM) {
        // Create transaction if not exists
        await tx.transactions.upsert({
          where: { id: transaction.id },
          create: transaction,
          update: transaction,
        });

        // Link to budget
        await tx.budget_transactions.create({
          data: {
            budget_id: entity.id,
            transaction_id: transaction.id,
            user_id: entity.props.budget.userId,
          },
        });
      }

      // 3. Handle updated transactions
      for (const transaction of updatedSpendingORM) {
        await tx.transactions.update({
          where: { id: transaction.id },
          data: transaction,
        });
      }

      // 4. Handle removed transactions
      if (removedSpendingORM.length > 0) {
        await tx.budget_transactions.deleteMany({
          where: {
            budget_id: entity.id,
            transaction_id: { in: removedSpendingORM.map((t) => t.id) },
          },
        });

        await tx.transactions.deleteMany({
          where: { id: { in: removedSpendingORM.map((t) => t.id) } },
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
        user_id: props.userId,
        amount: props.amount?.value,
        created_at: props.createdAt,
        updated_at: props.updatedAt,
        name: props.name,
        month: props.month,
        year: props.year,
        category: props.category,
        color: props.color,
        icon: props.icon,
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
        name: props.name,
        user_id: props.userId,
        month: props.month,
        year: props.year,
        category: props.category,
        color: props.color,
        icon: props.icon,
        amount: props.amount?.value,
        created_at: props.createdAt,
        updated_at: props.updatedAt,
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

  async delete(budgetAggregate: BudgetAggregate): Promise<void> {
    const budget = budgetAggregate.props.budget;
    const transactions = budgetAggregate.props.spending.items;

    await this.prismaClient.$transaction(async (tx) => {
      await tx.budgets.delete({
        where: { id: budget.id },
      });

      await tx.budget_transactions.deleteMany({
        where: { budget_id: budget.id },
      });

      await tx.transactions.deleteMany({
        where: { id: { in: transactions.map((t) => t.id) } },
      });
    });
  }
}
