import { CurrentUser } from '@/common/decorators';
import { AuthUser } from '@/common/types';
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateBudgetUseCase } from '../use-cases/create-budget.use-case';
import { GetBudgetsUseCase } from '../use-cases/get-budgets.user-case';
import { BudgetResponseDto } from './dto/budget.dto';
import { CreateBudgetDto } from './dto/create-budget.dto';

@ApiTags('Budgets')
@ApiBearerAuth()
@Controller('budgets')
export class BudgetController {
  constructor(
    private readonly createBudgetUseCase: CreateBudgetUseCase,
    private readonly getBudgetsUseCase: GetBudgetsUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new budget' })
  @ApiResponse({
    status: 201,
    description: 'Budget created successfully',
    type: BudgetResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createBudget(@Body() createBudgetDto: CreateBudgetDto) {
    return this.createBudgetUseCase.execute(createBudgetDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all budgets for the current user in a month' })
  @ApiResponse({
    status: 200,
    description: 'List of budgets for the current user in a month',
    type: [BudgetResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getBudgets(
    @CurrentUser() user: AuthUser,
    @Query('month') month: number,
    @Query('year') year: number,
  ) {
    return (
      await this.getBudgetsUseCase.execute({ userId: user.id, month, year })
    ).map((budget) => budget.toObject());
  }
}
