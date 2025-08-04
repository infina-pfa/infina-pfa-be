import { CurrentUser } from '@/common/decorators';
import { AuthUser } from '@/common/types';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateBudgetUseCase } from '../use-cases/create-budget.use-case';
import { GetBudgetDetailUseCase } from '../use-cases/get-budget-detail.use-case';
import { GetBudgetsUseCase } from '../use-cases/get-budgets.user-case';
import { GetMonthlySpendingUseCase } from '../use-cases/get-monthly-spending.use-case';
import { SpendUseCase } from '../use-cases/spend.use-case';
import { UpdateBudgetUseCase } from '../use-cases/update-budget.use-case';
import { BudgetResponseDto } from './dto/budget.dto';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { MonthlySpendingQueryDto } from './dto/monthly-spending-query.dto';
import { SpendDto } from './dto/spend.dto';
import { TransactionResponseDto } from './dto/transaction.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';

@ApiTags('Budgets')
@ApiBearerAuth()
@Controller('budgets')
export class BudgetController {
  constructor(
    private readonly createBudgetUseCase: CreateBudgetUseCase,
    private readonly getBudgetsUseCase: GetBudgetsUseCase,
    private readonly getBudgetDetailUseCase: GetBudgetDetailUseCase,
    private readonly getMonthlySpendingUseCase: GetMonthlySpendingUseCase,
    private readonly updateBudgetUseCase: UpdateBudgetUseCase,
    private readonly spendUseCase: SpendUseCase,
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
  @ApiResponse({
    status: 409,
    description: 'Budget with same name already exists for this month',
  })
  async createBudget(
    @Body() createBudgetDto: CreateBudgetDto,
    @CurrentUser() user: AuthUser,
  ): Promise<BudgetResponseDto> {
    const budget = await this.createBudgetUseCase.execute({
      ...createBudgetDto,
      userId: user.id,
    });

    return BudgetResponseDto.fromEntity(budget);
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
  ): Promise<BudgetResponseDto[]> {
    return (
      await this.getBudgetsUseCase.execute({ userId: user.id, month, year })
    ).map((budget) => BudgetResponseDto.fromEntity(budget));
  }

  @Get('spending')
  @ApiOperation({
    summary: 'Get monthly spending transactions',
    description:
      'Retrieve all outcome transactions linked to budgets for a specific month and year',
  })
  @ApiResponse({
    status: 200,
    description: 'List of spending transactions for the specified month',
    type: [TransactionResponseDto],
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid query parameters',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMonthlySpending(
    @CurrentUser() user: AuthUser,
    @Query() query: MonthlySpendingQueryDto,
  ): Promise<TransactionResponseDto[]> {
    const transactions = await this.getMonthlySpendingUseCase.execute({
      userId: user.id,
      month: query.month,
      year: query.year,
    });

    return TransactionResponseDto.fromTransactionEntities(transactions);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get budget detail by ID' })
  @ApiParam({ name: 'id', description: 'Budget ID' })
  @ApiResponse({
    status: 200,
    description: 'Budget detail retrieved successfully',
    type: BudgetResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid budget ID format' })
  @ApiResponse({ status: 401, description: 'User not authenticated' })
  @ApiResponse({ status: 403, description: 'Access denied to budget' })
  @ApiResponse({ status: 404, description: 'Budget not found' })
  async getBudgetDetail(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ): Promise<BudgetResponseDto> {
    const budget = await this.getBudgetDetailUseCase.execute({
      id,
      userId: user.id,
    });

    return BudgetResponseDto.fromEntity(budget, true);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a budget' })
  @ApiParam({ name: 'id', description: 'Budget ID' })
  @ApiResponse({
    status: 200,
    description: 'Budget updated successfully',
    type: BudgetResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Budget not found' })
  async updateBudget(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBudgetDto: UpdateBudgetDto,
    @CurrentUser() user: AuthUser,
  ): Promise<BudgetResponseDto> {
    const updatedBudget = await this.updateBudgetUseCase.execute({
      id,
      props: {
        ...(updateBudgetDto.name !== undefined && {
          name: updateBudgetDto.name,
        }),
        ...(updateBudgetDto.category !== undefined && {
          category: updateBudgetDto.category,
        }),
        ...(updateBudgetDto.color !== undefined && {
          color: updateBudgetDto.color,
        }),
        ...(updateBudgetDto.icon !== undefined && {
          icon: updateBudgetDto.icon,
        }),
        userId: user.id,
      },
    });

    return BudgetResponseDto.fromEntity(updatedBudget);
  }

  @Post(':id/spend')
  @ApiOperation({ summary: 'Record spending for a budget' })
  @ApiParam({ name: 'id', description: 'Budget ID' })
  @ApiResponse({
    status: 201,
    description: 'Spending recorded successfully',
    type: TransactionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Budget not found' })
  async spend(
    @Param('id') id: string,
    @Body() spendDto: SpendDto,
    @CurrentUser() user: AuthUser,
  ): Promise<void> {
    await this.spendUseCase.execute({
      budgetId: id,
      userId: user.id,
      amount: spendDto.amount,
      name: spendDto.name,
      description: spendDto.description,
      recurring: spendDto.recurring,
    });
  }
}
