import { GoalType } from '@/goals/domain';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateGoalDto {
  @ApiProperty({
    description: 'Title of the goal',
    example: 'Buy a house',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Description of the goal',
    example: 'Save for a down payment on a house in the suburbs',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Target amount to achieve the goal (in the default currency)',
    example: 50000,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  targetAmount?: number;

  @ApiProperty({
    description: 'Due date for the goal',
    example: '2025-12-31T23:59:59Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiProperty({
    description: 'Type of the goal',
    example: 'emergency',
    required: false,
  })
  @IsEnum(GoalType)
  @IsOptional()
  type?: GoalType;
}

export class CreateGoalInternalDto extends CreateGoalDto {
  @ApiProperty({
    description: 'User ID who owns this goal',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  userId: string;
}
