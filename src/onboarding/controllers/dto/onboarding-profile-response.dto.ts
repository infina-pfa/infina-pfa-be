import { OnboardingProfileEntity } from '@/onboarding/domain';
import { ApiProperty } from '@nestjs/swagger';

export class OnboardingProfileResponseDto {
  @ApiProperty({
    description: 'Profile ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId: string;

  @ApiProperty({
    description: 'Monthly expense amount',
    example: 1500,
    nullable: true,
  })
  expense: number | null;

  @ApiProperty({
    description: 'Monthly income amount',
    example: 3000,
    nullable: true,
  })
  income: number | null;

  @ApiProperty({
    description: 'Pay Yourself First amount',
    example: 300,
    nullable: true,
  })
  pyfAmount: number | null;

  @ApiProperty({
    description: 'Additional metadata',
    example: { financialGoals: ['retirement'], riskTolerance: 'moderate' },
    nullable: true,
  })
  metadata: Record<string, any> | null;

  @ApiProperty({
    description: 'Completion timestamp',
    example: '2025-08-05T10:30:00Z',
    nullable: true,
  })
  completedAt: Date | null;

  @ApiProperty({
    description: 'Whether the onboarding is completed',
    example: false,
  })
  isCompleted: boolean;

  @ApiProperty({
    description: 'Profile creation timestamp',
    example: '2025-08-05T10:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Profile last update timestamp',
    example: '2025-08-05T10:30:00Z',
  })
  updatedAt: Date;

  static fromEntity(
    entity: OnboardingProfileEntity,
  ): OnboardingProfileResponseDto {
    return {
      id: entity.id,
      userId: entity.userId,
      expense: entity.expense?.value || null,
      income: entity.income?.value || null,
      pyfAmount: entity.pyfAmount?.value || null,
      metadata: entity.metadata,
      completedAt: entity.completedAt,
      isCompleted: entity.isCompleted(),
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
