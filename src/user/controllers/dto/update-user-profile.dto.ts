import { ApiProperty } from '@nestjs/swagger';
import { Currency, Language } from '@/common/types/user';
import { FinancialStage } from '@/user/domain/entities/user.entity';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';

export class UpdateUserProfileDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'Full name of the user',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Name cannot be empty' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  @Matches(/.*\S.*/, { message: 'Name cannot contain only whitespace' })
  name?: string;

  @ApiProperty({
    example: 'building_wealth',
    description: 'Current financial stage of the user',
    enum: [
      FinancialStage.DEBT,
      FinancialStage.START_SAVING,
      FinancialStage.START_INVESTING,
    ],
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsEnum(
    [
      FinancialStage.DEBT,
      FinancialStage.START_SAVING,
      FinancialStage.START_INVESTING,
    ],
    {
      message:
        'Financial stage must be one of: getting_started, building_wealth, preserving_wealth, retirement_planning',
    },
  )
  financialStage?: FinancialStage;

  @ApiProperty({
    example: 'usd',
    description: 'Preferred currency for the user',
    enum: Currency,
    required: false,
  })
  @IsOptional()
  @IsEnum(Currency, {
    message: 'Currency must be one of: vnd, usd, eur',
  })
  currency?: Currency;

  @ApiProperty({
    example: 'vi',
    description: 'Preferred language for the user',
    enum: Language,
    required: false,
  })
  @IsOptional()
  @IsEnum(Language, {
    message: 'Language must be one of: vi, en',
  })
  language?: Language;
}
