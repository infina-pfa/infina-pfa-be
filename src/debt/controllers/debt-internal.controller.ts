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
  CreateDebtUseCase,
  GetDebtUseCase,
  GetDebtsUseCase,
  GetMonthlyPaymentUseCase,
  PayDebtUseCase,
  RemoveDebtPaymentUseCase,
  RemoveDebtUseCase,
  UpdateDebtUseCase,
} from '../use-cases';
import {
  CreateDebtDto,
  DebtDto,
  DebtResponseDto,
  PayDebtDto,
  UpdateDebtDto,
} from './dto';

@ApiTags('Debts')
@ApiBearerAuth('x-api-key')
@Controller('/internal/debts')
@UseGuards(InternalServiceAuthGuard)
export class DebtInternalController {
  constructor(
    private readonly createDebtUseCase: CreateDebtUseCase,
    private readonly getDebtsUseCase: GetDebtsUseCase,
    private readonly getDebtUseCase: GetDebtUseCase,
    private readonly updateDebtUseCase: UpdateDebtUseCase,
    private readonly payDebtUseCase: PayDebtUseCase,
    private readonly removeDebtPaymentUseCase: RemoveDebtPaymentUseCase,
    private readonly removeDebtUseCase: RemoveDebtUseCase,
    private readonly getMonthlyPaymentUseCase: GetMonthlyPaymentUseCase,
  ) {}

  @Get('monthly-payment')
  @ApiOperation({
    summary: 'Get the debt monthly payment for the current user',
  })
  @ApiResponse({
    status: 200,
    description: 'Monthly payment retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMonthlyPayment(
    @Query('userId') userId: string,
  ): Promise<{ monthlyPayment: number }> {
    return this.getMonthlyPaymentUseCase.execute({ userId });
  }

  @Post(':id/payments')
  @ApiOperation({ summary: 'Record a payment for a debt' })
  @ApiParam({ name: 'id', description: 'Debt ID' })
  @ApiResponse({
    status: 201,
    description: 'Payment recorded successfully',
    type: DebtResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Access denied to debt' })
  @ApiResponse({ status: 404, description: 'Debt not found' })
  async payDebt(
    @Param('id') id: string,
    @Body() payDebtDto: PayDebtDto,
    @Query('userId') userId: string,
  ): Promise<DebtResponseDto> {
    const debt = await this.payDebtUseCase.execute({
      debtId: id,
      userId,
      amount: payDebtDto.amount,
      name: payDebtDto.name,
      description: payDebtDto.description,
    });

    return DebtResponseDto.fromAggregate(debt, true);
  }

  @Delete(':id/payments/:paymentId')
  @ApiOperation({ summary: 'Remove a debt payment' })
  @ApiParam({ name: 'id', description: 'Debt ID' })
  @ApiParam({ name: 'paymentId', description: 'Payment ID' })
  @ApiResponse({ status: 200, description: 'Payment removed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Access denied to debt' })
  @ApiResponse({ status: 404, description: 'Debt or payment not found' })
  async removeDebtPayment(
    @Param('id') id: string,
    @Param('paymentId') paymentId: string,
    @Query('userId') userId: string,
  ): Promise<void> {
    await this.removeDebtPaymentUseCase.execute({
      userId,
      debtId: id,
      debtPaymentId: paymentId,
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a debt' })
  @ApiParam({ name: 'id', description: 'Debt ID' })
  @ApiResponse({ status: 200, description: 'Debt removed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Access denied to debt' })
  @ApiResponse({ status: 404, description: 'Debt not found' })
  async removeDebt(
    @Param('id') id: string,
    @Query('userId') userId: string,
  ): Promise<void> {
    await this.removeDebtUseCase.execute({
      userId,
      debtId: id,
    });
  }

  @Post()
  @ApiOperation({ summary: 'Create a new debt' })
  @ApiResponse({
    status: 201,
    description: 'Debt created successfully',
    type: DebtResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createDebt(
    @Body() createDebtDto: CreateDebtDto,
    @Query('userId') userId: string,
  ): Promise<DebtResponseDto> {
    const debt = await this.createDebtUseCase.execute({
      ...createDebtDto,
      userId,
      currentPaidAmount: createDebtDto.currentPaidAmount ?? 0,
    });

    return DebtResponseDto.fromAggregate(debt, true);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get debt detail by ID' })
  @ApiParam({ name: 'id', description: 'Debt ID' })
  @ApiResponse({
    status: 200,
    description: 'Debt detail retrieved successfully',
    type: DebtResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid debt ID format' })
  @ApiResponse({ status: 401, description: 'User not authenticated' })
  @ApiResponse({ status: 403, description: 'Access denied to debt' })
  @ApiResponse({ status: 404, description: 'Debt not found' })
  async getDebtDetail(
    @Param('id') id: string,
    @Query('userId') userId: string,
  ): Promise<DebtResponseDto> {
    const debt = await this.getDebtUseCase.execute({
      debtId: id,
      userId,
    });

    return DebtResponseDto.fromAggregate(debt, true);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a debt' })
  @ApiParam({ name: 'id', description: 'Debt ID' })
  @ApiResponse({
    status: 200,
    description: 'Debt updated successfully',
    type: DebtResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Access denied to debt' })
  @ApiResponse({ status: 404, description: 'Debt not found' })
  async updateDebt(
    @Param('id') id: string,
    @Body() updateDebtDto: UpdateDebtDto,
    @Query('userId') userId: string,
  ): Promise<DebtDto> {
    const debt = await this.updateDebtUseCase.execute({
      debtId: id,
      userId,
      lender: updateDebtDto.lender,
      purpose: updateDebtDto.purpose,
      rate: updateDebtDto.rate,
      dueDate: updateDebtDto.dueDate,
      type: updateDebtDto.type,
    });

    return DebtDto.fromEntity(debt);
  }

  @Get()
  @ApiOperation({ summary: 'Get all debts for the current user' })
  @ApiResponse({
    status: 200,
    description: 'List of debts for the current user',
    type: [DebtResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getDebts(@Query('userId') userId: string): Promise<DebtResponseDto[]> {
    const debts = await this.getDebtsUseCase.execute({ userId });

    return debts.map((debt) => DebtResponseDto.fromAggregate(debt, true));
  }
}
