import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  CreateBudgetUseCase,
  CreateBudgetUseCaseInput,
} from '../use-cases/create-budget.use-case';
import { GetBudgetsUseCase } from '../use-cases/get-budgets.user-case';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { AuthUser } from '@/common/index';

@Controller('budgets')
export class BudgetController {
  constructor(
    private readonly createBudgetUseCase: CreateBudgetUseCase,
    private readonly getBudgetsUseCase: GetBudgetsUseCase,
  ) {}

  @Post()
  async createBudget(@Body() createBudgetDto: CreateBudgetUseCaseInput) {
    return this.createBudgetUseCase.execute(createBudgetDto);
  }

  @Get()
  async getBudgets(@CurrentUser() user: AuthUser) {
    return (await this.getBudgetsUseCase.execute({ userId: user.id })).map(
      (budget) => budget.toObject(),
    );
  }
}
