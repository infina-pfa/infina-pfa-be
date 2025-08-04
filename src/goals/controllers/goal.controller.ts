import { CurrentUser } from '@/common/decorators';
import { AuthUser, Currency } from '@/common/types';
import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateGoalUseCase, UpdateGoalUseCase } from '../use-cases';
import { CreateGoalDto, GoalResponseDto, UpdateGoalDto } from './dto';
import { CurrencyVO } from '@/common/base';

@ApiTags('Goals')
@ApiBearerAuth()
@Controller('goals')
export class GoalController {
  constructor(
    private readonly createGoalUseCase: CreateGoalUseCase,
    private readonly updateGoalUseCase: UpdateGoalUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new financial goal' })
  @ApiResponse({
    status: 201,
    description: 'Goal created successfully',
    type: GoalResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 409,
    description: 'Goal with same title already exists for this user',
  })
  async createGoal(
    @Body() createGoalDto: CreateGoalDto,
    @CurrentUser() user: AuthUser,
  ): Promise<GoalResponseDto> {
    const goalAggregate = await this.createGoalUseCase.execute({
      ...createGoalDto,
      userId: user.id,
      dueDate: createGoalDto.dueDate
        ? new Date(createGoalDto.dueDate)
        : undefined,
    });

    return GoalResponseDto.fromEntity(goalAggregate);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a financial goal' })
  @ApiParam({ name: 'id', description: 'Goal ID' })
  @ApiResponse({
    status: 200,
    description: 'Goal updated successfully',
    type: GoalResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Goal not found' })
  @ApiResponse({
    status: 409,
    description: 'Goal with same title already exists for this user',
  })
  async updateGoal(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateGoalDto: UpdateGoalDto,
    @CurrentUser() user: AuthUser,
  ): Promise<GoalResponseDto> {
    const goalAggregate = await this.updateGoalUseCase.execute({
      id,
      userId: user.id,
      props: {
        ...updateGoalDto,
        dueDate: updateGoalDto.dueDate
          ? new Date(updateGoalDto.dueDate)
          : undefined,
        targetAmount: updateGoalDto.targetAmount
          ? new CurrencyVO(updateGoalDto.targetAmount, Currency.VND)
          : undefined,
      },
    });

    return GoalResponseDto.fromEntity(goalAggregate);
  }
}
