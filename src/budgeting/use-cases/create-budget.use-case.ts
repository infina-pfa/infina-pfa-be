import { Injectable } from '@nestjs/common';
import { BudgetCategory, BudgetRepository } from '@/budgeting/domain';
import { BudgetEntity } from '@/budgeting/domain/entities/budget.entity';

export type CreateBudgetUseCaseInput = {
  amount: number;
  category: BudgetCategory;
  color: string;
  icon: string;
  month: number;
  userId: string;
  year: number;
  name: string;
};

@Injectable()
export class CreateBudgetUseCase {
  constructor(private readonly budgetRepository: BudgetRepository) {}

  async execute(input: CreateBudgetUseCaseInput): Promise<BudgetEntity> {
    const budget = BudgetEntity.create({
      ...input,
    });
    return this.budgetRepository.create(budget);
  }
}
