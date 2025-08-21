export abstract class DebtManagerService {
  abstract getMonthlyPayment(userId: string): Promise<number>;
}
