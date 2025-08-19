import { CurrencyVO } from '@/common/base';

export abstract class GoalManagerService {
  abstract createEmergencyFundGoal(
    userId: string,
    dueDate: Date,
    amount: CurrencyVO,
  ): Promise<void>;
}
