import { CurrentUser } from '@/common/decorators';
import { AuthUser } from '@/common/types';
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateBudgetUseCase } from '../use-cases/create-budget.use-case';
import { GetBudgetsUseCase } from '../use-cases/get-budgets.user-case';
import { UpdateBudgetUseCase } from '../use-cases/update-budget.use-case';
import { BudgetResponseDto } from './dto/budget.dto';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';

@ApiTags('Budgets')
@ApiBearerAuth()
@Controller('budgets')
export class BudgetController {
  constructor(
    private readonly createBudgetUseCase: CreateBudgetUseCase,
    private readonly getBudgetsUseCase: GetBudgetsUseCase,
    private readonly updateBudgetUseCase: UpdateBudgetUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new budget' })
  @ApiResponse({
    status: 201,
    description: 'Budget created successfully',
    type: BudgetResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createBudget(
    @Body() createBudgetDto: CreateBudgetDto,
  ): Promise<BudgetResponseDto> {
    const budget = await this.createBudgetUseCase.execute(createBudgetDto);

    return BudgetResponseDto.fromEntity(budget);
  }

  @Get()
  @ApiOperation({ summary: 'Get all budgets for the current user in a month' })
  @ApiResponse({
    status: 200,
    description: 'List of budgets for the current user in a month',
    type: [BudgetResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getBudgets(
    @CurrentUser() user: AuthUser,
    @Query('month') month: number,
    @Query('year') year: number,
  ): Promise<BudgetResponseDto[]> {
    return (
      await this.getBudgetsUseCase.execute({ userId: user.id, month, year })
    ).map((budget) => BudgetResponseDto.fromEntity(budget));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a budget' })
  @ApiParam({ name: 'id', description: 'Budget ID' })
  @ApiResponse({
    status: 200,
    description: 'Budget updated successfully',
    type: BudgetResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Budget not found' })
  async updateBudget(
    @Param('id') id: string,
    @Body() updateBudgetDto: UpdateBudgetDto,
    @CurrentUser() user: AuthUser,
  ): Promise<BudgetResponseDto> {
    const updatedBudget = await this.updateBudgetUseCase.execute({
      id,
      props: {
        name: updateBudgetDto.name,
        category: updateBudgetDto.category,
        color: updateBudgetDto.color,
        icon: updateBudgetDto.icon,
        userId: user.id,
      },
    });

    return BudgetResponseDto.fromEntity(updatedBudget);
  }
}
