import { Module } from '@nestjs/common';
import { repositories } from '@/budgeting/infrastructure/repositories';
import { services } from '@/budgeting/infrastructure/services';
import { budgetingUseCases } from '@/budgeting/use-cases';
import { BudgetController } from '@/budgeting/controllers/budget.controller';

@Module({
  controllers: [BudgetController],
  providers: [...repositories, ...services, ...budgetingUseCases],
  exports: [...repositories, ...services, ...budgetingUseCases],
})
export class BudgetingModule {}
