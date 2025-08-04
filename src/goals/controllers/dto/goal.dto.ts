import { BaseDto } from '@/common/base/dto/base.dto';
import { ApiProperty } from '@nestjs/swagger';
import { GoalAggregate } from '../../domain';
import { TransactionResponseDto } from '@/budgeting/controllers/dto/transaction.dto';

export class GoalResponseDto extends BaseDto {
  @ApiProperty({
    description: 'Title of the goal',
    example: 'Buy a house',
  })
  title: string;

  @ApiProperty({
    description: 'Description of the goal',
    example: 'Save for a down payment on a house in the suburbs',
    required: false,
    nullable: true,
  })
  description?: string;

  @ApiProperty({
    description: 'Current amount saved towards the goal',
    example: 10000,
  })
  currentAmount: number;

  @ApiProperty({
    description: 'Target amount to achieve the goal',
    example: 50000,
    required: false,
    nullable: true,
  })
  targetAmount?: number;

  @ApiProperty({
    description: 'Due date for the goal',
    example: '2025-12-31T23:59:59Z',
    required: false,
    nullable: true,
  })
  dueDate?: string;

  @ApiProperty({
    description: 'Created at',
    example: '2025-01-01T00:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Updated at',
    example: '2025-01-01T00:00:00Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Contributions',
    type: [TransactionResponseDto],
  })
  contributions: TransactionResponseDto[];

  static fromEntity(goalAggregate: GoalAggregate): GoalResponseDto {
    const goal = goalAggregate.goal;
    const contributions = goalAggregate.contributions;
    const props = goal.props;

    const dto = new GoalResponseDto();
    dto.id = goal.id;
    dto.title = props.title;
    dto.description = props.description;
    dto.currentAmount = props.currentAmount.value;
    dto.targetAmount = props.targetAmount?.value;
    dto.dueDate = props.dueDate?.toISOString();
    dto.contributions = contributions.map((contribution) =>
      TransactionResponseDto.fromEntity(contribution),
    );
    dto.createdAt = props.createdAt;
    dto.updatedAt = props.updatedAt;
    return dto;
  }
}
