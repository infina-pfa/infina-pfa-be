import { PrismaClient } from '@/common/prisma';
import { DebtManagerService } from '@/debt/domain';
import { Injectable, NotFoundException } from '@nestjs/common';

export type DebtDetails = {
  lender: string;
  purpose: string;
  rate: number;
  dueDate: Date;
  amount: number;
  currentPaidAmount: number;
};

@Injectable()
export class DebtManagerServiceImpl implements DebtManagerService {
  constructor(private readonly prismaClient: PrismaClient) {}

  private calculateMonthlyPayment(debts: DebtDetails): number {
    const { amount, rate, dueDate } = debts;
    const today = new Date();
    const timeDiff = dueDate.getTime() - today.getTime();
    const timeDiffInMonths = Math.ceil(timeDiff / (1000 * 60 * 60 * 24 * 30));
    return (amount * rate) / (1 - Math.pow(1 + rate, -timeDiffInMonths));
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

    const debts = onboardingProfile.metadata as unknown as {
      debts: DebtDetails[];
    };

    if (!debts) {
      return 0;
    }

    const monthlyPayment = debts.debts.reduce((acc, debt) => {
      return acc + this.calculateMonthlyPayment(debt);
    }, 0);

    return monthlyPayment;
  }
}
