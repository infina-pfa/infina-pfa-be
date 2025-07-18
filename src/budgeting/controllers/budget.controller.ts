import { Body, Controller, Post } from '@nestjs/common';
import {
  CreateBudgetUseCase,
  CreateBudgetUseCaseInput,
} from '../use-cases/create-budget.use-case';

@Controller('budgets')
export class BudgetController {
  constructor(private readonly createBudgetUseCase: CreateBudgetUseCase) {}

  @Post()
  async createBudget(@Body() createBudgetDto: CreateBudgetUseCaseInput) {
    return this.createBudgetUseCase.execute(createBudgetDto);
  }
}
