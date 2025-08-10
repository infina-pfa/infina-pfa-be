import { Injectable } from '@nestjs/common';
import {
  CreateBudgetProps,
  OnboardingErrorFactory,
  OnboardingProfileRepository,
} from '../domain';
import { BaseUseCase, CurrencyVO } from '@/common/base';
import { BudgetManagerService } from '../domain';

export class CompleteOnboardingUseCaseInput {
  userId: string;
}

const iconMaps = {
  food: 'food',
  rent: 'home',
  transport: 'car',
  utilities: 'lightbulb',
};

const colorMaps = {
  food: '#FF5733',
  rent: '#33FF57',
  transport: '#3357FF',
  utilities: '#FF33A1',
};

@Injectable()
export class CompleteOnboardingUseCase extends BaseUseCase<
  CompleteOnboardingUseCaseInput,
  void
> {
  constructor(
    private readonly onboardingProfileRepository: OnboardingProfileRepository,
    private readonly budgetManagerService: BudgetManagerService,
  ) {
    super();
  }

  async execute(input: CompleteOnboardingUseCaseInput): Promise<void> {
    const profile = await this.onboardingProfileRepository.findOne({
      userId: input.userId,
    });
    if (!profile) {
      throw OnboardingErrorFactory.profileNotFound();
    }

    if (!profile.metadata) {
      throw OnboardingErrorFactory.notFoundInformation('Metadata');
    }

    const emergencyFundGoal = profile.metadata.goalDetails?.amount;
    const pyfAmount = profile.metadata.goalDetails?.monthlyTarget;

    if (!emergencyFundGoal) {
      throw OnboardingErrorFactory.notFoundInformation('Emergency fund goal');
    }

    const income = emergencyFundGoal / 3;
    const budgets = profile.metadata.expenseBreakdown;

    const budgetProps: CreateBudgetProps[] = Object.entries(budgets).map(
      ([name, amount]) => ({
        name,
        amount: new CurrencyVO(amount),
        category: 'fixed',
        icon: iconMaps[name as keyof typeof iconMaps],
        color: colorMaps[name as keyof typeof colorMaps],
        month: new Date().getMonth(),
        year: new Date().getFullYear(),
      }),
    );
    budgetProps.push({
      name: 'Thoải mái chi tiêu',
      amount: new CurrencyVO(
        income -
          pyfAmount -
          Object.values(budgets).reduce((acc, curr) => acc + curr, 0),
      ),
      category: 'flexible',
      icon: 'wallet',
      color: '#FF33A1',
      month: new Date().getMonth(),
      year: new Date().getFullYear(),
    });

    profile.update({
      completedAt: new Date(),
      income: new CurrencyVO(income),
      expense: new CurrencyVO(income - pyfAmount),
      pyfAmount: new CurrencyVO(pyfAmount),
    });

    await this.onboardingProfileRepository.update(profile);
    await this.budgetManagerService.createBudgets(input.userId, budgetProps);
  }
}
