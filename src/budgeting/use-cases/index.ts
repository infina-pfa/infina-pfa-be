import { Provider } from '@nestjs/common';
import { CreateBudgetUseCase } from './create-budget.use-case';

export const budgetingUseCases: Provider[] = [CreateBudgetUseCase];
