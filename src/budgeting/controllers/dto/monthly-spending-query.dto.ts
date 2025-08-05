import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, Min, Max, IsUUID } from 'class-validator';

export class MonthlySpendingQueryDto {
  @ApiProperty({
    description: 'Month (1-12)',
    example: 3,
    minimum: 1,
    maximum: 12,
  })
  @Transform(({ value }) => parseInt(value as string))
  @IsInt({ message: 'Month must be an integer' })
  @Min(1, { message: 'Month must be between 1 and 12' })
  @Max(12, { message: 'Month must be between 1 and 12' })
  month: number;

  @ApiProperty({
    description: 'Year',
    example: 2024,
    minimum: 1900,
    maximum: 3000,
  })
  @Transform(({ value }) => parseInt(value as string))
  @IsInt({ message: 'Year must be an integer' })
  @Min(1900, { message: 'Year must be a valid year' })
  @Max(3000, { message: 'Year must be a valid year' })
  year: number;
}

export class MonthlySpendingQueryInternalDto extends MonthlySpendingQueryDto {
  @ApiProperty({
    description: 'User ID who owns this budget',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  userId: string;
}
