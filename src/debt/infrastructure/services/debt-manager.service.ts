import { PrismaClient } from '@/common/prisma';
import { DebtAggregateRepository, DebtManagerService } from '@/debt/domain';
import { Injectable, NotFoundException } from '@nestjs/common';

export type DebtDetails = {
  rate: number;
  dueDate: string;
  amount: number;
  currentPaidAmount: number;
};

@Injectable()
export class DebtManagerServiceImpl implements DebtManagerService {
  constructor(
    private readonly prismaClient: PrismaClient,
    private readonly debtAggregateRepository: DebtAggregateRepository,
  ) {}

  private calculateMonthlyPayment(debts: DebtDetails): number {
    const { amount, rate, dueDate, currentPaidAmount } = debts;
    const today = new Date();
    const timeDiff = new Date(dueDate).getTime() - today.getTime();
    const timeDiffInMonths = Math.ceil(timeDiff / (1000 * 60 * 60 * 24 * 30));

    if (rate === 0) {
      return timeDiffInMonths === 0
        ? amount - currentPaidAmount
        : (amount - currentPaidAmount) / timeDiffInMonths;
    }

    return (
      ((amount - currentPaidAmount) * (rate / 100)) /
      (1 - Math.pow(1 + rate / 100, -timeDiffInMonths))
    );
  }

  private async getMonthlyPaymentFromDebt(userId: string): Promise<number> {
    const debts = await this.debtAggregateRepository.findMany({
      userId,
    });

    if (debts.length === 0) {
      return 0;
    }

    const monthlyPayment = debts.reduce((acc, debt) => {
      return (
        acc +
        this.calculateMonthlyPayment({
          rate: debt.rate,
          dueDate: debt.dueDate.toISOString(),
          amount: debt.amount.value,
          currentPaidAmount: debt.currentPaidAmount.value,
        })
      );
    }, 0);

    return monthlyPayment;
  }

  async getMonthlyPayment(userId: string): Promise<number> {
    const onboardingProfile =
      await this.prismaClient.onboarding_profiles.findFirst({
        where: {
          user_id: userId,
        },
      });

    if (!onboardingProfile) {
      throw new NotFoundException('Onboarding profile not found');
    }

    if (onboardingProfile.completed_at) {
      return await this.getMonthlyPaymentFromDebt(userId);
    }

    const metadata = onboardingProfile.metadata as unknown as {
      debts: DebtDetails[];
    };

    if (!metadata) {
      return 0;
    }

    const monthlyPayment = metadata.debts?.reduce((acc, debt) => {
      return acc + this.calculateMonthlyPayment(debt);
    }, 0);

    return monthlyPayment || 0;
  }
}
