import { PrismaClient } from '@/common/prisma';
import { calculateMonthlyPayment, DebtDetails } from '@/common/utils';
import { DebtAggregateRepository, DebtManagerService } from '@/debt/domain';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class DebtManagerServiceImpl implements DebtManagerService {
  constructor(
    private readonly prismaClient: PrismaClient,
    private readonly debtAggregateRepository: DebtAggregateRepository,
  ) {}

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
        calculateMonthlyPayment({
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
      return (
        acc +
        calculateMonthlyPayment({
          rate: debt.rate,
          dueDate: debt.dueDate,
          amount: debt.amount,
          currentPaidAmount: debt.currentPaidAmount,
        })
      );
    }, 0);

    return monthlyPayment || 0;
  }
}
