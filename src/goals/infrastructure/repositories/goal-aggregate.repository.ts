import {
  GoalAggregate,
  GoalAggregateRepository,
  GoalEntityProps,
  GoalRepository,
  TransactionRepository,
} from '@/goals/domain';
import { GoalTransactionsWatchList } from '@/goals/domain/watch-list/goal-transactions.watch-list';
import { PrismaClient } from '@/common/prisma/prisma-client';
import { GoalORM, TransactionORM } from '@/common/types/orms';
import { FindManyOptions } from '@/common/types/query.types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GoalAggregateRepositoryImpl implements GoalAggregateRepository {
  constructor(
    private readonly prismaClient: PrismaClient,
    private readonly goalRepository: GoalRepository,
    private readonly transactionRepository: TransactionRepository,
  ) {}

  toEntity(data: {
    id: string;
    goal: GoalORM;
    contributions: TransactionORM[];
  }): GoalAggregate {
    return GoalAggregate.create(
      {
        goal: this.goalRepository.toEntity(data.goal),
        transactions: new GoalTransactionsWatchList(
          data.contributions.map((transaction) =>
            this.transactionRepository.toEntity(transaction),
          ),
        ),
      },
      data.id,
    );
  }

  toORM(entity: GoalAggregate): {
    goal: GoalORM;
    contributions: TransactionORM[];
  } {
    return {
      goal: this.goalRepository.toORM(entity.props.goal) as GoalORM,
      contributions: entity.props.transactions.items.map(
        (transaction) =>
          this.transactionRepository.toORM(transaction) as TransactionORM,
      ),
    };
  }

  async save(entity: GoalAggregate): Promise<void> {
    const goalORM = this.toORM(entity);

    return this.prismaClient.$transaction(async (tx) => {
      // 1. Upsert goal
      await tx.goals.upsert({
        where: { id: entity.id },
        create: {
          ...goalORM.goal,
        },
        update: {
          ...goalORM.goal,
          updated_at: new Date(),
        },
      });

      // 2. Handle added transactions
      for (const transaction of entity.props.transactions.addedItems) {
        const transactionORM = this.transactionRepository.toORM(
          transaction,
        ) as TransactionORM;

        // Create transaction if not exists
        const createdTransaction = await tx.transactions.upsert({
          where: { id: transactionORM.id },
          create: transactionORM,
          update: transactionORM,
        });

        // Link to goal
        await tx.goal_transactions.create({
          data: {
            goal_id: entity.id,
            transaction_id: createdTransaction.id,
            user_id: entity.props.goal.userId,
          },
        });
      }

      // 3. Handle updated transactions
      for (const transaction of entity.props.transactions.updatedItems) {
        const transactionORM = this.transactionRepository.toORM(
          transaction,
        ) as TransactionORM;
        await tx.transactions.update({
          where: { id: transactionORM.id },
          data: transactionORM,
        });
      }

      // 4. Handle removed transactions
      for (const transaction of entity.props.transactions.removedItems) {
        await tx.goal_transactions.deleteMany({
          where: {
            goal_id: entity.id,
            transaction_id: transaction.id,
          },
        });
      }
    });
  }

  async findById(id: string): Promise<GoalAggregate | null> {
    const goalORM = await this.prismaClient.goals.findUnique({
      where: { id },
      include: {
        goal_transactions: { include: { transactions: true } },
      },
    });

    if (!goalORM) return null;

    return this.toEntity({
      id,
      goal: goalORM,
      contributions: goalORM.goal_transactions.map(
        (transaction) => transaction.transactions,
      ),
    });
  }

  async findOne(
    props: Partial<Readonly<GoalEntityProps>>,
  ): Promise<GoalAggregate | null> {
    const goalORM = await this.prismaClient.goals.findFirst({
      where: {
        user_id: props.userId,
        title: props.title,
        description: props.description,
        current_amount: props.currentAmount?.value,
        target_amount: props.targetAmount?.value,
        due_date: props.dueDate,
        created_at: props.createdAt,
        updated_at: props.updatedAt,
      },
      include: {
        goal_transactions: { include: { transactions: true } },
      },
    });

    if (!goalORM) return null;

    return this.toEntity({
      id: goalORM.id,
      goal: goalORM,
      contributions: goalORM.goal_transactions.map(
        (transaction) => transaction.transactions,
      ),
    });
  }

  async findMany(
    props: Partial<Readonly<GoalEntityProps>>,
    options?: FindManyOptions,
  ): Promise<GoalAggregate[]> {
    const goalORMs = await this.prismaClient.goals.findMany({
      where: {
        title: props.title,
        user_id: props.userId,
        description: props.description,
        current_amount: props.currentAmount?.value,
        target_amount: props.targetAmount?.value,
        due_date: props.dueDate,
        created_at: props.createdAt,
        updated_at: props.updatedAt,
      },
      include: {
        goal_transactions: { include: { transactions: true } },
      },
      take: options?.pagination?.limit,
      skip: options?.pagination?.page,
      orderBy: options?.sort?.map((sort) => ({
        [sort.field]: sort.direction,
      })),
    });

    return goalORMs.map((goalORM) =>
      this.toEntity({
        id: goalORM.id,
        goal: goalORM,
        contributions: goalORM.goal_transactions.map(
          (transaction) => transaction.transactions,
        ),
      }),
    );
  }
}
