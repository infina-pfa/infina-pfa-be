import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from '../domain/entities/user.entity';

export class UserProfileResponseDto {
  @ApiProperty({ example: 'user-123', description: 'User unique identifier' })
  id: string;

  @ApiProperty({ example: 'John Doe', description: 'User full name' })
  name: string;

  @ApiProperty({
    example: 'start_investing',
    description: 'Current financial stage',
    nullable: true,
  })
  financialStage: string | null;

  @ApiProperty({
    example: '2024-01-15T10:30:00Z',
    description: 'When user completed onboarding',
    nullable: true,
  })
  onboardingCompletedAt: Date | null;

  @ApiProperty({
    example: '2024-01-01T00:00:00Z',
    description: 'Account creation date',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-15T10:30:00Z',
    description: 'Last profile update',
  })
  updatedAt: Date;

  static fromEntity(entity: UserEntity): UserProfileResponseDto {
    const {
      name,
      financialStage,
      onboardingCompletedAt,
      createdAt,
      updatedAt,
    } = entity.props;

    return {
      id: entity.id,
      name,
      financialStage,
      onboardingCompletedAt,
      createdAt,
      updatedAt,
    };
  }
}
