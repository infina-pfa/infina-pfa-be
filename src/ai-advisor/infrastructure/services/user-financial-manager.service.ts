import {
  AiAdvisorErrorFactory,
  UserFinancialAction,
  UserFinancialManagerService,
} from '@/ai-advisor/domain';
import { PrismaClient } from '@/common/prisma';
import { Injectable } from '@nestjs/common';
import { isToday, startOfWeek, isWithinInterval, startOfMonth } from 'date-fns';

export enum BudgetingStyle {
  DETAIL_TRACKER = 'detail_tracker',
  GOAL_FOCUSED = 'goal_focused',
}

@Injectable()
export class UserFinancialManagerServiceImpl extends UserFinancialManagerService {
  constructor(private readonly prismaClient: PrismaClient) {
    super();
  }

  async getPyfMetadata(userId: string): Promise<{
    reasonNotPyf: string | null;
    reminderDate: Date | null;
  }> {
    const onboardingProfile =
      await this.prismaClient.onboarding_profiles.findFirst({
        where: {
          user_id: userId,
        },
      });

    if (!onboardingProfile) {
      throw AiAdvisorErrorFactory.onboardingProfileNotFound();
    }

    const { reasonNotPyf, reminderDate } =
      (onboardingProfile.pyf_metadata as {
        reasonNotPyf: string | null;
        reminderDate: Date | null;
      }) ?? {};

    return {
      reasonNotPyf,
      reminderDate,
    };
  }

  private isFromMondayToToday(date: Date): boolean {
    const monday = startOfWeek(new Date(), { weekStartsOn: 1 });
    const today = new Date();

    return isWithinInterval(date, {
      start: monday,
      end: today,
    });
  }

  async getRecordSpendingInfo(userId: string): Promise<{
    recorded: boolean;
    lastRecordedAt: Date | null;
  }> {
    const onboardingProfile =
      await this.prismaClient.onboarding_profiles.findFirst({
        where: { user_id: userId },
      });

    if (!onboardingProfile) {
      throw AiAdvisorErrorFactory.onboardingProfileNotFound();
    }

    const budgetingStyle = onboardingProfile.budgeting_style as BudgetingStyle;
    const lastSpending = await this.prismaClient.transactions.findFirst({
      where: {
        user_id: userId,
        created_at: {
          lte: new Date(),
        },
        type: 'budget_spending',
      },
    });
    if (budgetingStyle === BudgetingStyle.DETAIL_TRACKER) {
      return {
        recorded: lastSpending !== null && isToday(lastSpending.created_at),
        lastRecordedAt: lastSpending?.created_at ?? null,
      };
    }
    return {
      recorded:
        lastSpending !== null &&
        this.isFromMondayToToday(lastSpending.created_at),
      lastRecordedAt: lastSpending?.created_at ?? null,
    };
  }

  private async getPyfDoneAt(userId: string): Promise<{
    pyfAmount: number;
    currentPyf: number;
    pyfAt: Date | null;
  }> {
    const user = await this.prismaClient.public_users.findFirst({
      where: {
        user_id: userId,
      },
    });

    if (!user) {
      throw AiAdvisorErrorFactory.userNotFound();
    }

    const onboardingProfile =
      await this.prismaClient.onboarding_profiles.findFirst({
        where: {
          user_id: userId,
        },
      });

    const pyfTransactions = await this.prismaClient.transactions.findMany({
      where: {
        user_id: userId,
        type: 'goal_contribution',
        created_at: {
          gte: startOfMonth(new Date()),
          lte: new Date(),
        },
      },
    });

    return {
      pyfAmount: onboardingProfile?.pyf_amount?.toNumber() || 0,
      currentPyf: pyfTransactions.reduce(
        (acc, transaction) => acc + transaction.amount.toNumber(),
        0,
      ),
      pyfAt: pyfTransactions[pyfTransactions.length - 1]?.created_at ?? null,
    };
  }

  private async getSetupNextBudget(userId: string): Promise<boolean> {
    const today = new Date();
    let nextMonth = today.getMonth() + 2;
    let nextYear = today.getFullYear();
    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear++;
    }

    const nextMonthBudgets = await this.prismaClient.budgets.findFirst({
      where: {
        user_id: userId,
        month: nextMonth,
        year: nextYear,
      },
    });

    return nextMonthBudgets !== null;
  }

  async getUserFinancialAction(userId: string): Promise<UserFinancialAction> {
    const { reasonNotPyf, reminderDate } = await this.getPyfMetadata(userId);
    const { recorded, lastRecordedAt } =
      await this.getRecordSpendingInfo(userId);

    return {
      pyf: {
        ...(await this.getPyfDoneAt(userId)),
        reasonNotPyf,
        reminderDate,
      },
      recordSpending: {
        recorded,
        lastRecordedAt,
      },
      setupNextBudget: await this.getSetupNextBudget(userId),
    };
  }
}
