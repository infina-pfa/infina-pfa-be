import { Module } from '@nestjs/common';
import { repositories } from '@/budgeting/infrastructure/repositories';
import { budgetingUseCases } from '@/budgeting/use-cases';
import { BudgetController } from '@/budgeting/controllers/budget.controller';

@Module({
  controllers: [BudgetController],
  providers: [...repositories, ...budgetingUseCases],
  exports: [...repositories, ...budgetingUseCases],
})
export class BudgetingModule {}
