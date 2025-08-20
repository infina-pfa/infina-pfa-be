import { BaseDto } from '@/common/base/dto/base.dto';
import { TransactionType } from '@/common/types/transaction';
import { DebtAggregate, DebtEntity, DebtPaymentEntity } from '@/debt/domain';
import { ApiProperty } from '@nestjs/swagger';

export class DebtDto extends BaseDto {
  @ApiProperty({
    description: 'User ID who owns this debt',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId: string;

  @ApiProperty({
    description: 'Debt amount',
    example: 100,
  })
  amount: number;

  @ApiProperty({
    description: 'Debt rate',
    example: 10,
  })
  rate: number;

  @ApiProperty({
    description: 'Debt due date',
    example: '2023-01-01T00:00:00.000Z',
  })
  dueDate: Date;

  @ApiProperty({
    description: 'Debt lender',
    example: 'John Doe',
  })
  lender: string;

  @ApiProperty({
    description: 'Debt purpose',
    example: 'Buy a house',
  })
  purpose: string;

  @ApiProperty({
    description: 'Debt created at',
    example: '2023-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Debt updated at',
    example: '2023-01-01T00:00:00.000Z',
  })
  updatedAt: Date;

  public static fromEntity(debt: DebtEntity): DebtDto {
    const dto = new DebtDto();
    dto.id = debt.id;
    dto.userId = debt.userId;
    dto.amount = debt.amount.value;
    dto.rate = debt.rate;
    dto.dueDate = debt.dueDate;
    dto.lender = debt.lender;
    dto.purpose = debt.props.purpose;
    dto.createdAt = debt.props.createdAt;
    dto.updatedAt = debt.props.updatedAt;
    return dto;
  }
}

export class PaymentResponseDto {
  @ApiProperty({
    description: 'Transaction ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Payment name',
    example: '',
  })
  name: string;

  @ApiProperty({
    description: 'Payment description',
    example: 'Weekly grocery shopping at Walmart',
  })
  description: string;

  @ApiProperty({
    description: 'Payment amount',
    example: 50,
  })
  amount: number;

  @ApiProperty({
    description: 'Payment type',
    enum: TransactionType,
    example: TransactionType.DEBT_PAYMENT,
  })
  type: TransactionType;

  @ApiProperty({
    description: 'Recurring frequency in days (0 for one-time)',
    example: 0,
  })
  recurring: number;

  @ApiProperty({
    description: 'Payment creation date',
    example: '2023-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Payment last update date',
    example: '2023-01-01T00:00:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Debt',
    type: DebtDto,
  })
  debt: DebtDto;

  static fromEntity(
    payment: DebtPaymentEntity,
    debt: DebtEntity,
  ): PaymentResponseDto {
    const dto = new PaymentResponseDto();
    dto.id = payment.id;
    dto.name = payment.props.name;
    dto.description = payment.props.description ?? '';
    dto.amount = payment.amount.value;
    dto.type = payment.props.type;
    dto.recurring = payment.props.recurring;
    dto.createdAt = payment.props.createdAt;
    dto.updatedAt = payment.props.updatedAt;
    dto.debt = debt ? DebtDto.fromEntity(debt) : new DebtDto();
    return dto;
  }
}

export class DebtResponseDto extends BaseDto {
  @ApiProperty({
    description: 'User ID who owns this debt',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId: string;

  @ApiProperty({
    description: 'Debt lender',
    example: 'John Doe',
  })
  lender: string;

  @ApiProperty({
    description: 'Debt purpose',
    example: 'Buy a house',
  })
  purpose: string;

  @ApiProperty({
    description: 'Interest rate',
    example: 5.5,
  })
  rate: number;

  @ApiProperty({
    description: 'Due date for the debt',
    example: '2025-12-31T00:00:00.000Z',
  })
  dueDate: Date;

  @ApiProperty({
    description: 'Total debt amount',
    example: 10000,
  })
  amount: number;

  @ApiProperty({
    description: 'Current paid amount',
    example: 2500,
  })
  currentPaidAmount: number;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2023-07-21T15:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2023-07-21T15:30:00Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'List of debt payments',
    type: [PaymentResponseDto],
    required: false,
  })
  payments?: PaymentResponseDto[];

  public static fromAggregate(
    aggregate: DebtAggregate,
    includePayments = false,
  ): DebtResponseDto {
    const { debt } = aggregate.props;
    const dto = new DebtResponseDto();
    dto.id = debt.id;
    dto.userId = debt.userId;
    dto.lender = debt.props.lender;
    dto.purpose = debt.props.purpose;
    dto.rate = aggregate.rate;
    dto.dueDate = aggregate.dueDate;
    dto.amount = aggregate.amount.value;
    dto.currentPaidAmount = aggregate.currentPaidAmount.value;
    dto.createdAt = debt.props.createdAt;
    dto.updatedAt = debt.props.updatedAt;

    if (includePayments) {
      dto.payments = aggregate.payments.items.map((payment) =>
        PaymentResponseDto.fromEntity(payment, debt),
      );
    }

    return dto;
  }
}
