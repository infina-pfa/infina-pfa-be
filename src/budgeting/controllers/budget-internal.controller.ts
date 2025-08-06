import { InternalServiceAuthGuard } from '@/common/guards';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  AddIncomeUseCase,
  DeleteBudgetUseCase,
  DeleteSpendingUseCase,
  GetIncomeByMonthUseCase,
  RemoveIncomeUseCase,
  UpdateIncomeUseCase,
} from '../use-cases';
import { CreateBudgetUseCase } from '../use-cases/create-budget.use-case';
import { GetBudgetDetailUseCase } from '../use-cases/get-budget-detail.use-case';
import { GetBudgetsUseCase } from '../use-cases/get-budgets.user-case';
import { GetMonthlySpendingUseCase } from '../use-cases/get-monthly-spending.use-case';
import { SpendUseCase } from '../use-cases/spend.use-case';
import { UpdateBudgetUseCase } from '../use-cases/update-budget.use-case';
import { BudgetResponseDto } from './dto/budget.dto';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { CreateIncomeDto } from './dto/create-income.dto';
import { MonthlyIncomeQueryDto } from './dto/monthly-income-query.dto';
import { MonthlySpendingQueryInternalDto } from './dto/monthly-spending-query.dto';
import { SpendInternalDto } from './dto/spend.dto';
import { TransactionResponseDto } from './dto/transaction.dto';
import { UpdateBudgetInternalDto } from './dto/update-budget.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { CurrencyVO } from '@/common/base';

@ApiTags('Budgets')
@ApiBearerAuth('x-api-key')
@Controller('internal/budgets')
@UseGuards(InternalServiceAuthGuard)
export class BudgetInternalController {
  constructor(
    private readonly createBudgetUseCase: CreateBudgetUseCase,
    private readonly getBudgetsUseCase: GetBudgetsUseCase,
    private readonly getBudgetDetailUseCase: GetBudgetDetailUseCase,
    private readonly getMonthlySpendingUseCase: GetMonthlySpendingUseCase,
    private readonly updateBudgetUseCase: UpdateBudgetUseCase,
    private readonly spendUseCase: SpendUseCase,
    private readonly deleteBudgetUseCase: DeleteBudgetUseCase,
    private readonly deleteSpendingUseCase: DeleteSpendingUseCase,
    private readonly getMonthlyIncomeUseCase: GetIncomeByMonthUseCase,
    private readonly updateIncomeUseCase: UpdateIncomeUseCase,
    private readonly removeIncomeUseCase: RemoveIncomeUseCase,
    private readonly addIncomeUseCase: AddIncomeUseCase,
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
  ): Promise<BudgetResponseDto> {
    const budget = await this.createBudgetUseCase.execute({
      ...createBudgetDto,
      userId: createBudgetDto.userId,
    });

    return BudgetResponseDto.fromAggregate(budget);
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
    @Param('userId') userId: string,
    @Param('month') month: number,
    @Param('year') year: number,
  ): Promise<BudgetResponseDto[]> {
    return (await this.getBudgetsUseCase.execute({ userId, month, year })).map(
      (budget) => BudgetResponseDto.fromAggregate(budget),
    );
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
    @Query() query: MonthlySpendingQueryInternalDto,
  ): Promise<TransactionResponseDto[]> {
    const transactions = await this.getMonthlySpendingUseCase.execute({
      userId: query.userId,
      month: query.month,
      year: query.year,
    });

    // Handle null/undefined responses gracefully
    if (!transactions) {
      return [];
    }

    return transactions.map((transaction) =>
      TransactionResponseDto.fromEntity(
        transaction.transaction,
        transaction.budget,
      ),
    );
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
  async getBudgetDetail(@Param('id') id: string): Promise<BudgetResponseDto> {
    const budget = await this.getBudgetDetailUseCase.execute({
      id,
    });

    return BudgetResponseDto.fromAggregate(budget, true);
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
    @Param('id') id: string,
    @Body() updateBudgetDto: UpdateBudgetInternalDto,
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
        ...(updateBudgetDto.amount !== undefined && {
          amount: new CurrencyVO(updateBudgetDto.amount),
        }),
        userId: updateBudgetDto.userId,
      },
    });

    return BudgetResponseDto.fromAggregate(updatedBudget);
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
    @Body() spendDto: SpendInternalDto,
  ): Promise<BudgetResponseDto> {
    const budget = await this.spendUseCase.execute({
      budgetId: id,
      userId: spendDto.userId,
      amount: spendDto.amount,
      name: spendDto.name,
      description: spendDto.description,
      recurring: spendDto.recurring,
    });

    return BudgetResponseDto.fromAggregate(budget, true);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a budget' })
  @ApiParam({ name: 'id', description: 'Budget ID' })
  @ApiResponse({ status: 200, description: 'Budget deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Budget not found' })
  async deleteBudget(@Param('id') id: string): Promise<void> {
    await this.deleteBudgetUseCase.execute({ budgetId: id });
  }

  @Delete(':id/spending/:spendingId')
  @ApiOperation({ summary: 'Delete a spending' })
  @ApiParam({ name: 'id', description: 'Budget ID' })
  @ApiParam({ name: 'spendingId', description: 'Spending ID' })
  @ApiResponse({ status: 200, description: 'Spending deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Access denied to spending' })
  @ApiResponse({ status: 404, description: 'Spending not found' })
  async deleteSpending(
    @Param('id') id: string,
    @Param('spendingId') spendingId: string,
  ): Promise<void> {
    await this.deleteSpendingUseCase.execute({ spendingId });
  }

  @Get('income/:userId')
  @ApiOperation({ summary: 'Get monthly income transactions' })
  @ApiResponse({
    status: 200,
    description: 'Monthly income transactions retrieved successfully',
    type: [TransactionResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMonthlyIncome(
    @Param('userId') userId: string,
    @Query() query: MonthlyIncomeQueryDto,
  ): Promise<TransactionResponseDto[]> {
    const income = await this.getMonthlyIncomeUseCase.execute({
      userId,
      month: query.month,
      year: query.year,
    });

    if (!income) {
      return [];
    }

    return income.props.transactions.items.map((transaction) =>
      TransactionResponseDto.fromEntity(transaction),
    );
  }

  @Post('income')
  @ApiOperation({ summary: 'Add a new income transaction' })
  @ApiResponse({
    status: 201,
    description: 'Income transaction added successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async addIncome(
    @Body() incomeDto: CreateIncomeDto,
  ): Promise<TransactionResponseDto> {
    const income = await this.addIncomeUseCase.execute({
      userId: incomeDto.userId,
      amount: incomeDto.amount,
      recurring: incomeDto.recurring,
      name: incomeDto.name,
    });
    return TransactionResponseDto.fromEntity(
      income.props.transactions.items[0],
    );
  }

  @Patch('income/:id')
  @ApiOperation({ summary: 'Update an income transaction' })
  @ApiParam({ name: 'id', description: 'Income ID' })
  @ApiResponse({
    status: 200,
    description: 'Income transaction updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Income transaction not found' })
  async updateIncome(
    @Param('id') id: string,
    @Body() updateIncomeDto: UpdateIncomeDto,
  ): Promise<TransactionResponseDto> {
    const income = await this.updateIncomeUseCase.execute({
      id,
      amount: updateIncomeDto.amount,
      recurring: updateIncomeDto.recurring,
      name: updateIncomeDto.name,
    });
    return TransactionResponseDto.fromEntity(income);
  }

  @Delete('income/:id')
  @ApiOperation({ summary: 'Delete an income transaction' })
  @ApiParam({ name: 'id', description: 'Income ID' })
  @ApiResponse({
    status: 200,
    description: 'Income transaction deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Access denied to income' })
  @ApiResponse({ status: 404, description: 'Income transaction not found' })
  async deleteIncome(
    @Param('id') id: string,
    @Query('userId') userId: string,
  ): Promise<void> {
    await this.removeIncomeUseCase.execute({ id, userId });
  }
}
