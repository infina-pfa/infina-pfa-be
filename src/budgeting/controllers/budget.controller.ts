import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { AuthUser } from '@/common/index';
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreateBudgetUseCase,
  CreateBudgetUseCaseInput,
} from '../use-cases/create-budget.use-case';
import { GetBudgetsWithSpendingUseCase } from '../use-cases/get-budgets-with-spending.use-case';
import { GetBudgetsUseCase } from '../use-cases/get-budgets.user-case';
import { GetBudgetsWithSpendingQueryDto } from './dto/budget-with-spending.dto';
import {
  BudgetResponseDto,
  BudgetWithSpendingResponseDto,
} from './dto/budget.dto';

@ApiTags('Budgets')
@ApiBearerAuth()
@Controller('budgets')
export class BudgetController {
  constructor(
    private readonly createBudgetUseCase: CreateBudgetUseCase,
    private readonly getBudgetsUseCase: GetBudgetsUseCase,
    private readonly getBudgetsWithSpendingUseCase: GetBudgetsWithSpendingUseCase,
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
  async createBudget(@Body() createBudgetDto: CreateBudgetUseCaseInput) {
    return this.createBudgetUseCase.execute(createBudgetDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all budgets for the current user' })
  @ApiResponse({
    status: 200,
    description: 'List of budgets',
    type: [BudgetResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getBudgets(@CurrentUser() user: AuthUser) {
    return (await this.getBudgetsUseCase.execute({ userId: user.id })).map(
      (budget) => budget.toObject(),
    );
  }

  @Get('with-spending')
  @ApiOperation({
    summary: 'Get budgets with spending analytics for the current user',
    description:
      'Retrieves budgets enriched with spending data including total spent, transaction count, remaining amount, and spending percentage',
  })
  @ApiQuery({
    name: 'month',
    required: false,
    description: 'Month (1-12). Defaults to current month',
    example: 7,
    type: Number,
  })
  @ApiQuery({
    name: 'year',
    required: false,
    description: 'Year. Defaults to current year',
    example: 2023,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'List of budgets with spending analytics',
    type: [BudgetWithSpendingResponseDto],
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid month or year',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getBudgetsWithSpending(
    @CurrentUser() user: AuthUser,
    @Query() query: GetBudgetsWithSpendingQueryDto,
  ) {
    const budgetsWithSpending =
      await this.getBudgetsWithSpendingUseCase.execute({
        userId: user.id,
        month: query.month,
        year: query.year,
      });

    return budgetsWithSpending.map((projection) => projection.toObject());
  }
}
