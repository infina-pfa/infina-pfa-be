import {
  BudgetTransactionAggregate,
  BudgetRepository,
  TransactionRepository,
} from '@/budgeting/domain';
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../prisma/prisma-client';

@Injectable()
export class BudgetTransactionPrismaRepository {
  constructor(
    protected readonly prisma: PrismaClient,
    protected readonly budgetRepository: BudgetRepository,
    protected readonly transactionRepository: TransactionRepository,
  ) {}

  public async create(
    entity: BudgetTransactionAggregate,
  ): Promise<BudgetTransactionAggregate> {
    const { userId, transactions, budget } = entity.props;
    await this.prisma.budget_transactions.createMany({
      data: transactions.map((transaction) => ({
        id: transaction.id,
        user_id: userId,
        budget_id: budget.id,
        transaction_id: transaction.id,
      })),
    });
    await this.transactionRepository.createMany(transactions);
    return entity;
  }

  public async findByUserId(
    userId: string,
  ): Promise<BudgetTransactionAggregate[]> {
    const budgetTransactions = await this.prisma.budget_transactions.findMany({
      where: {
        user_id: userId,
      },
      include: {
        transactions: true,
        budgets: true,
      },
    });
    return budgetTransactions.map((budgetTransaction) => {
      return BudgetTransactionAggregate.create({
        userId: budgetTransaction.user_id,
        transactions: budgetTransaction.transactions.map((transaction) =>
          this.transactionRepository.toEntity(transaction),
        ),
        budget: this.budgetRepository.toEntity(budgetTransaction.budgets),
      });
    });
  }

  // public async findMany(
  //   props: Partial<BudgetTransactionAggregateProps>,
  // ): Promise<BudgetTransactionAggregate | null> {
  //   const budgetTransactionAggregate =
  //     await this.prisma.budget_transactions.findFirst({
  //       where: {
  //         user_id: props.userId,
  //         budget_id: props.budget?.id,
  //         transaction_id: props.transactions?.[0]?.id,
  //       },
  //     });
  //   const transactions = await t
  //   if (!budgetTransactionAggregate) return null;
  //   return this.toEntity(budgetTransactionAggregate);
  // }
}
