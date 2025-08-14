import { UserFinancialAction } from '..';

export abstract class UserFinancialManagerService {
  abstract getUserFinancialAction(userId: string): Promise<UserFinancialAction>;
}
