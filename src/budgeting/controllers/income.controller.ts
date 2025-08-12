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
  GetIncomeByMonthUseCase,
  RemoveIncomeUseCase,
  UpdateIncomeUseCase,
} from '../use-cases';
import { CreateIncomeDto } from './dto/create-income.dto';
import { MonthlyIncomeQueryDto } from './dto/monthly-income-query.dto';
import { TransactionResponseDto } from './dto/transaction.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';

@ApiTags('Incomes')
@ApiBearerAuth()
@Controller('incomes')
@UseGuards(SupabaseAuthGuard)
export class IncomeController {
  constructor(
    private readonly getMonthlyIncomeUseCase: GetIncomeByMonthUseCase,
    private readonly addIncomeUseCase: AddIncomeUseCase,
    private readonly updateIncomeUseCase: UpdateIncomeUseCase,
    private readonly removeIncomeUseCase: RemoveIncomeUseCase,
  ) {}

  @Get()
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

  @Post()
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

  @Patch(':id')
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

  @Delete(':id')
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
