import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

export class MonthlyIncomeQueryDto {
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
