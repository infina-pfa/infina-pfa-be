import { BudgetInternalController } from '@/budgeting/controllers/budget-internal.controller';
import { repositories } from '@/budgeting/infrastructure/repositories';
import { budgetingUseCases } from '@/budgeting/use-cases';
import { Module } from '@nestjs/common';

@Module({
  controllers: [BudgetInternalController],
  providers: [...repositories, ...budgetingUseCases],
  exports: [...repositories, ...budgetingUseCases],
})
export class BudgetingInternalModule {}
