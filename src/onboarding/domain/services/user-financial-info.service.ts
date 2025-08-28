import { FinancialStage } from '@/common/types';

export abstract class UserFinancialInfoService {
  abstract getThisWeekAllowance(userId: string): Promise<number>;

  abstract getUserFinancialStage(userId: string): Promise<FinancialStage>;
}
