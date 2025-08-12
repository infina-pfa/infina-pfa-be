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
  GetIncomeByMonthUseCase,
  RemoveIncomeUseCase,
  UpdateIncomeUseCase,
} from '../use-cases';
import { CreateIncomeInternalDto } from './dto/create-income.dto';
import { MonthlyIncomeQueryDto } from './dto/monthly-income-query.dto';
import { TransactionResponseDto } from './dto/transaction.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';

@ApiTags('Incomes')
@ApiBearerAuth('x-api-key')
@Controller('internal/incomes')
@UseGuards(InternalServiceAuthGuard)
export class IncomeInternalController {
  constructor(
    private readonly getMonthlyIncomeUseCase: GetIncomeByMonthUseCase,
    private readonly updateIncomeUseCase: UpdateIncomeUseCase,
    private readonly removeIncomeUseCase: RemoveIncomeUseCase,
    private readonly addIncomeUseCase: AddIncomeUseCase,
  ) {}

  @Get(':userId')
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

  @Post()
  @ApiOperation({ summary: 'Add a new income transaction' })
  @ApiResponse({
    status: 201,
    description: 'Income transaction added successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async addIncome(
    @Body() incomeDto: CreateIncomeInternalDto,
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
  ): Promise<TransactionResponseDto> {
    const income = await this.updateIncomeUseCase.execute({
      id,
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
    @Query('userId') userId: string,
  ): Promise<void> {
    await this.removeIncomeUseCase.execute({ id, userId });
  }
}
