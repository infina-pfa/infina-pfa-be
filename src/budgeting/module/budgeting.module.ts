import { BudgetController } from '@/budgeting/controllers/budget.controller';
import { IncomeController } from '@/budgeting/controllers/income.controller';
import { repositories } from '@/budgeting/infrastructure/repositories';
import { budgetingUseCases } from '@/budgeting/use-cases';
import { Module } from '@nestjs/common';

@Module({
  controllers: [BudgetController, IncomeController],
  providers: [...repositories, ...budgetingUseCases],
  exports: [...repositories, ...budgetingUseCases],
})
export class BudgetingModule {}
