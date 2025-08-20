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
@ApiBearerAuth()
@Controller('debts')
@UseGuards(SupabaseAuthGuard)
export class DebtController {
  constructor(
    private readonly createDebtUseCase: CreateDebtUseCase,
    private readonly getDebtsUseCase: GetDebtsUseCase,
    private readonly getDebtUseCase: GetDebtUseCase,
    private readonly updateDebtUseCase: UpdateDebtUseCase,
    private readonly payDebtUseCase: PayDebtUseCase,
    private readonly removeDebtPaymentUseCase: RemoveDebtPaymentUseCase,
    private readonly removeDebtUseCase: RemoveDebtUseCase,
  ) {}

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
    @CurrentUser() user: AuthUser,
  ): Promise<DebtResponseDto> {
    const debt = await this.createDebtUseCase.execute({
      ...createDebtDto,
      userId: user.id,
      currentPaidAmount: createDebtDto.currentPaidAmount ?? 0,
    });

    return DebtResponseDto.fromAggregate(debt);
  }

  @Get()
  @ApiOperation({ summary: 'Get all debts for the current user' })
  @ApiResponse({
    status: 200,
    description: 'List of debts for the current user',
    type: [DebtResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getDebts(@CurrentUser() user: AuthUser): Promise<DebtResponseDto[]> {
    const debts = await this.getDebtsUseCase.execute({ userId: user.id });

    return debts.map((debt) => DebtResponseDto.fromAggregate(debt));
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
    @CurrentUser() user: AuthUser,
  ): Promise<DebtResponseDto> {
    const debt = await this.getDebtUseCase.execute({
      debtId: id,
      userId: user.id,
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
    @CurrentUser() user: AuthUser,
  ): Promise<DebtDto> {
    const debt = await this.updateDebtUseCase.execute({
      debtId: id,
      userId: user.id,
      lender: updateDebtDto.lender,
      purpose: updateDebtDto.purpose,
      rate: updateDebtDto.rate,
      dueDate: updateDebtDto.dueDate,
    });

    return DebtDto.fromEntity(debt);
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
    @CurrentUser() user: AuthUser,
  ): Promise<DebtResponseDto> {
    const debt = await this.payDebtUseCase.execute({
      debtId: id,
      userId: user.id,
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
    @CurrentUser() user: AuthUser,
  ): Promise<void> {
    await this.removeDebtPaymentUseCase.execute({
      userId: user.id,
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
    @CurrentUser() user: AuthUser,
  ): Promise<void> {
    await this.removeDebtUseCase.execute({
      userId: user.id,
      debtId: id,
    });
  }
}
