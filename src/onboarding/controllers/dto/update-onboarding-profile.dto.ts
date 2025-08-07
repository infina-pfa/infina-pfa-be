import { BudgetingStyle } from '@/onboarding/domain';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  Min,
} from 'class-validator';

export class UpdateOnboardingProfileDto {
  @ApiProperty({
    description: 'Monthly expense amount',
    example: 1500,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  expense?: number;

  @ApiProperty({
    description: 'Monthly income amount',
    example: 3000,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  income?: number;

  @ApiProperty({
    description: 'Pay Yourself First amount',
    example: 300,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  pyfAmount?: number;

  @ApiProperty({
    description: 'Additional metadata for the onboarding profile',
    example: {
      financialGoals: ['retirement', 'emergency_fund'],
      riskTolerance: 'moderate',
    },
    required: false,
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiProperty({
    description: 'Mark the onboarding as completed',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  markAsCompleted?: boolean;

  @ApiProperty({
    description: 'Budgeting style',
    example: 'detail_tracker',
    required: false,
  })
  @IsOptional()
  @IsEnum(BudgetingStyle)
  budgetingStyle?: BudgetingStyle;
}
