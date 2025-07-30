import { Injectable } from '@nestjs/common';
import { BudgetCategory, BudgetRepository } from '@/budgeting/domain';
import { BudgetEntity } from '@/budgeting/domain/entities/budget.entity';
import { CurrencyVO } from '@/common/value-objects';

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
      amount: new CurrencyVO(input.amount),
      createdAt: new Date(),
      updatedAt: new Date(),
      archivedAt: null,
    });
    return this.budgetRepository.create(budget);
  }
}
