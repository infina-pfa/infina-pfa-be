import { CurrencyVO } from '@/common/base';
import { CurrentUser } from '@/common/decorators';
import { SupabaseAuthGuard } from '@/common/guards';
import { AuthUser } from '@/common/types';
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
import { MonthlySpendingQueryDto } from './dto/monthly-spending-query.dto';
import { SpendDto } from './dto/spend.dto';
import { TransactionResponseDto } from './dto/transaction.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';

@ApiTags('Budgets')
@ApiBearerAuth()
@Controller('budgets')
@UseGuards(SupabaseAuthGuard)
export class BudgetController {
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
    private readonly addIncomeUseCase: AddIncomeUseCase,
    private readonly updateIncomeUseCase: UpdateIncomeUseCase,
    private readonly removeIncomeUseCase: RemoveIncomeUseCase,
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
    @CurrentUser() user: AuthUser,
    @Query('month') month: number,
    @Query('year') year: number,
  ): Promise<BudgetResponseDto[]> {
    return (
      await this.getBudgetsUseCase.execute({ userId: user.id, month, year })
    ).map((budget) => BudgetResponseDto.fromAggregate(budget));
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
  async getBudgetDetail(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ): Promise<BudgetResponseDto> {
    const budget = await this.getBudgetDetailUseCase.execute({
      id,
      userId: user.id,
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
        ...(updateBudgetDto.amount !== undefined && {
          amount: new CurrencyVO(updateBudgetDto.amount),
        }),
        userId: user.id,
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
    @Body() spendDto: SpendDto,
    @CurrentUser() user: AuthUser,
  ): Promise<BudgetResponseDto> {
    const budget = await this.spendUseCase.execute({
      budgetId: id,
      userId: user.id,
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
  async deleteBudget(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ): Promise<void> {
    await this.deleteBudgetUseCase.execute({ userId: user.id, budgetId: id });
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
    @CurrentUser() user: AuthUser,
  ): Promise<void> {
    await this.deleteSpendingUseCase.execute({ userId: user.id, spendingId });
  }

  @Get('income')
  @ApiOperation({ summary: 'Get monthly income transactions' })
  @ApiResponse({
    status: 200,
    description: 'Monthly income transactions retrieved successfully',
    type: [TransactionResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMonthlyIncome(
    @Query() query: MonthlyIncomeQueryDto,
    @CurrentUser() user: AuthUser,
  ): Promise<TransactionResponseDto[]> {
    const income = await this.getMonthlyIncomeUseCase.execute({
      userId: user.id,
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
    @CurrentUser() user: AuthUser,
  ): Promise<TransactionResponseDto> {
    const income = await this.addIncomeUseCase.execute({
      userId: user.id,
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
    @CurrentUser() user: AuthUser,
  ): Promise<TransactionResponseDto> {
    const income = await this.updateIncomeUseCase.execute({
      id,
      userId: user.id,
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
    @CurrentUser() user: AuthUser,
  ): Promise<void> {
    await this.removeIncomeUseCase.execute({ id, userId: user.id });
  }
}
