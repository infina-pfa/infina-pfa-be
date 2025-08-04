import { CurrencyVO } from '@/common/base';
import { CurrentUser } from '@/common/decorators';
import { SupabaseAuthGuard } from '@/common/guards';
import { AuthUser, Currency } from '@/common/types';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  ContributeGoalUseCase,
  CreateGoalUseCase,
  GetGoalsUseCase,
  UpdateGoalUseCase,
  WithdrawGoalUseCase,
} from '../use-cases';
import {
  ContributeGoalDto,
  CreateGoalDto,
  GoalResponseDto,
  UpdateGoalDto,
  WithdrawGoalDto,
} from './dto';

@ApiTags('Goals')
@ApiBearerAuth()
@Controller('goals')
@UseGuards(SupabaseAuthGuard)
export class GoalController {
  constructor(
    private readonly createGoalUseCase: CreateGoalUseCase,
    private readonly getGoalsUseCase: GetGoalsUseCase,
    private readonly updateGoalUseCase: UpdateGoalUseCase,
    private readonly contributeGoalUseCase: ContributeGoalUseCase,
    private readonly withdrawGoalUseCase: WithdrawGoalUseCase,
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

  @Get()
  @ApiOperation({ summary: 'Get all user financial goals' })
  @ApiResponse({
    status: 200,
    description: 'Goals retrieved successfully',
    type: [GoalResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getGoals(@CurrentUser() user: AuthUser): Promise<GoalResponseDto[]> {
    const goalAggregates = await this.getGoalsUseCase.execute({
      userId: user.id,
    });

    return goalAggregates.map((goalAggregate) =>
      GoalResponseDto.fromEntity(goalAggregate),
    );
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

  @Post(':id/contribute')
  @ApiOperation({ summary: 'Contribute to a financial goal' })
  @ApiParam({ name: 'id', description: 'Goal ID' })
  @ApiResponse({
    status: 200,
    description: 'Contribution added successfully',
    type: GoalResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Goal not found' })
  async contributeToGoal(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() contributeGoalDto: ContributeGoalDto,
    @CurrentUser() user: AuthUser,
  ): Promise<GoalResponseDto> {
    const goalAggregate = await this.contributeGoalUseCase.execute({
      goalId: id,
      userId: user.id,
      amount: contributeGoalDto.amount,
      name: contributeGoalDto.name,
      description: contributeGoalDto.description,
      recurring: contributeGoalDto.recurring,
    });

    return GoalResponseDto.fromEntity(goalAggregate);
  }

  @Post(':id/withdraw')
  @ApiOperation({ summary: 'Withdraw from a financial goal' })
  @ApiParam({ name: 'id', description: 'Goal ID' })
  @ApiResponse({
    status: 200,
    description: 'Withdrawal processed successfully',
    type: GoalResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request or insufficient balance',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Goal not found' })
  async withdrawFromGoal(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() withdrawGoalDto: WithdrawGoalDto,
    @CurrentUser() user: AuthUser,
  ): Promise<GoalResponseDto> {
    const goalAggregate = await this.withdrawGoalUseCase.execute({
      goalId: id,
      userId: user.id,
      amount: withdrawGoalDto.amount,
      name: withdrawGoalDto.name,
      description: withdrawGoalDto.description,
      recurring: withdrawGoalDto.recurring,
    });

    return GoalResponseDto.fromEntity(goalAggregate);
  }
}
