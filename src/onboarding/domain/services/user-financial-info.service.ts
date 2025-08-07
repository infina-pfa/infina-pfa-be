export abstract class UserFinancialInfoService {
  abstract getThisWeekAllowance(userId: string): Promise<number>;
}
