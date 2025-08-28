import { PrismaClient } from '@/common/prisma';
import { FinancialStage } from '@/common/types';
import {
  OnboardingProfileRepository,
  UserFinancialInfoService,
} from '@/onboarding/domain';
import { Injectable, NotFoundException } from '@nestjs/common';
import { getWeekOfMonth } from 'date-fns';

@Injectable()
export class UserFinancialInfoServiceImpl implements UserFinancialInfoService {
  constructor(
    private readonly prismaClient: PrismaClient,
    private readonly onboardingProfileRepository: OnboardingProfileRepository,
  ) {}

  async getThisWeekAllowance(userId: string): Promise<number> {
    const userProfile = await this.onboardingProfileRepository.findOne({
      userId,
    });

    if (!userProfile) {
      throw new NotFoundException('User profile not found');
    }
    const today = new Date();
    const freeToSpendBudgets = await this.prismaClient.budgets.findMany({
      where: {
        user_id: userId,
        category: 'flexible',
        month: today.getMonth() + 1,
        year: today.getFullYear(),
      },
      include: {
        budget_transactions: {
          include: {
            transactions: true,
          },
        },
      },
    });

    const freeToSpend = freeToSpendBudgets.reduce(
      (acc, budget) => acc + budget.amount.toNumber(),
      0,
    );

    const spendingTransactions = freeToSpendBudgets.map((budget) =>
      budget.budget_transactions.map((budgetTransaction) =>
        budgetTransaction.transactions.amount.toNumber(),
      ),
    );

    const spendingThisMonth = spendingTransactions
      .flat()
      .reduce((acc, transaction) => acc + transaction, 0);

    return (freeToSpend * getWeekOfMonth(today)) / 4 - spendingThisMonth;
  }

  async getUserFinancialStage(userId: string): Promise<FinancialStage> {
    const user = await this.prismaClient.public_users.findFirst({
      where: { user_id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.financial_stage as FinancialStage;
  }
}
