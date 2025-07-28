import { Module } from '@nestjs/common';
import { repositories } from '@/budgeting/infrastructure/repositories';
import { budgetingUseCases } from '@/budgeting/use-cases';
import { BudgetController } from '@/budgeting/controllers/budget.controller';
import { BudgetAnalyticsService } from '@/budgeting/domain';

@Module({
  controllers: [BudgetController],
  providers: [...repositories, ...budgetingUseCases, BudgetAnalyticsService],
  exports: [...repositories, ...budgetingUseCases, BudgetAnalyticsService],
})
export class BudgetingModule {}
