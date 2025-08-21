import { PrismaClient } from '@/common/prisma';
import { DebtManagerService } from '@/debt/domain';
import { Injectable, NotFoundException } from '@nestjs/common';

export type DebtDetails = {
  lender: string;
  purpose: string;
  rate: number;
  dueDate: string;
  amount: number;
  currentPaidAmount: number;
};

@Injectable()
export class DebtManagerServiceImpl implements DebtManagerService {
  constructor(private readonly prismaClient: PrismaClient) {}

  private calculateMonthlyPayment(debts: DebtDetails): number {
    const { amount, rate, dueDate } = debts;
    const today = new Date();
    const timeDiff = new Date(dueDate).getTime() - today.getTime();
    const timeDiffInMonths = Math.ceil(timeDiff / (1000 * 60 * 60 * 24 * 30));
    return (
      (amount * rate) / 100 / (1 - Math.pow(1 + rate / 100, -timeDiffInMonths))
    );
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
