import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsObject, Min } from 'class-validator';

export class CreateOnboardingProfileDto {
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
}
