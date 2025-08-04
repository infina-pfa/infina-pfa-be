import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { GoalController } from '../goal.controller';
import {
  CreateGoalUseCase,
  GetGoalsUseCase,
  UpdateGoalUseCase,
  ContributeGoalUseCase,
  WithdrawGoalUseCase,
} from '../../use-cases';
import {
  CreateGoalDto,
  GoalResponseDto,
  UpdateGoalDto,
  ContributeGoalDto,
  WithdrawGoalDto,
} from '../dto';
import { GoalAggregate, GoalErrorFactory } from '@/goals/domain';
import { GoalEntity } from '@/goals/domain/entities/goal.entity';
import { GoalTransactionsWatchList } from '@/goals/domain/watch-list/goal-transactions.watch-list';
import { AuthUser } from '@/common/types/auth-user';
import { CurrencyVO } from '@/common/base';
import { Currency } from '@/common/types';
import {
  TransactionEntity,
  TransactionType,
} from '@/budgeting/domain/entities/transactions.entity';

describe('GoalController', () => {
  let controller: GoalController;
  let createGoalUseCase: jest.Mocked<CreateGoalUseCase>;
  let getGoalsUseCase: jest.Mocked<GetGoalsUseCase>;
  let updateGoalUseCase: jest.Mocked<UpdateGoalUseCase>;
  let contributeGoalUseCase: jest.Mocked<ContributeGoalUseCase>;
  let withdrawGoalUseCase: jest.Mocked<WithdrawGoalUseCase>;

  const mockUserId = 'auth-user-123';
  const mockGoalId = 'goal-456';

  const mockAuthUser: AuthUser = {
    id: mockUserId,
    email: 'test@example.com',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: '2024-01-01T00:00:00Z',
  } as AuthUser;

  beforeEach(async () => {
    const mockCreateGoalUseCase = {
      execute: jest.fn(),
    };

    const mockGetGoalsUseCase = {
      execute: jest.fn(),
    };

    const mockUpdateGoalUseCase = {
      execute: jest.fn(),
    };

    const mockContributeGoalUseCase = {
      execute: jest.fn(),
    };

    const mockWithdrawGoalUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GoalController],
      providers: [
        {
          provide: CreateGoalUseCase,
          useValue: mockCreateGoalUseCase,
        },
        {
          provide: GetGoalsUseCase,
          useValue: mockGetGoalsUseCase,
        },
        {
          provide: UpdateGoalUseCase,
          useValue: mockUpdateGoalUseCase,
        },
        {
          provide: ContributeGoalUseCase,
          useValue: mockContributeGoalUseCase,
        },
        {
          provide: WithdrawGoalUseCase,
          useValue: mockWithdrawGoalUseCase,
        },
      ],
    }).compile();

    controller = module.get<GoalController>(GoalController);
    createGoalUseCase = module.get(CreateGoalUseCase);
    getGoalsUseCase = module.get(GetGoalsUseCase);
    updateGoalUseCase = module.get(UpdateGoalUseCase);
    contributeGoalUseCase = module.get(ContributeGoalUseCase);
    withdrawGoalUseCase = module.get(WithdrawGoalUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createMockGoalAggregate = (
    goalId: string = mockGoalId,
    userId: string = mockUserId,
    transactions: TransactionEntity[] = [],
  ): GoalAggregate => {
    const goalEntity = GoalEntity.create({
      userId,
      title: 'Test Goal',
      description: 'Test goal description',
      targetAmount: new CurrencyVO(5000, Currency.USD),
      currentAmount: new CurrencyVO(0, Currency.USD),
      dueDate: new Date('2025-12-31'),
    });

    return GoalAggregate.create(
      {
        goal: goalEntity,
        contributions: new GoalTransactionsWatchList(transactions),
      },
      goalId,
    );
  };

  describe('contributeToGoal', () => {
    describe('successful contributions', () => {
      it('should contribute to goal successfully with all fields', async () => {
        // Arrange
        const contributeDto: ContributeGoalDto = {
          amount: 100,
          name: 'Monthly contribution',
          description: 'Regular monthly savings',
          recurring: 30,
        };

        const mockGoalAggregate = createMockGoalAggregate();
        contributeGoalUseCase.execute.mockResolvedValue(mockGoalAggregate);

        // Act
        const result = await controller.contributeToGoal(
          mockGoalId,
          contributeDto,
          mockAuthUser,
        );

        // Assert
        expect(contributeGoalUseCase.execute).toHaveBeenCalledWith({
          goalId: mockGoalId,
          userId: mockUserId,
          amount: contributeDto.amount,
          name: contributeDto.name,
          description: contributeDto.description,
          recurring: contributeDto.recurring,
        });
        expect(result).toEqual(GoalResponseDto.fromEntity(mockGoalAggregate));
      });

      it('should contribute to goal with minimal required fields', async () => {
        // Arrange
        const contributeDto: ContributeGoalDto = {
          amount: 50,
        };

        const mockGoalAggregate = createMockGoalAggregate();
        contributeGoalUseCase.execute.mockResolvedValue(mockGoalAggregate);

        // Act
        const result = await controller.contributeToGoal(
          mockGoalId,
          contributeDto,
          mockAuthUser,
        );

        // Assert
        expect(contributeGoalUseCase.execute).toHaveBeenCalledWith({
          goalId: mockGoalId,
          userId: mockUserId,
          amount: contributeDto.amount,
          name: undefined,
          description: undefined,
          recurring: undefined,
        });
        expect(result).toEqual(GoalResponseDto.fromEntity(mockGoalAggregate));
      });

      it('should handle decimal contribution amounts', async () => {
        // Arrange
        const contributeDto: ContributeGoalDto = {
          amount: 123.45,
          name: 'Decimal contribution',
        };

        const mockGoalAggregate = createMockGoalAggregate();
        contributeGoalUseCase.execute.mockResolvedValue(mockGoalAggregate);

        // Act
        const result = await controller.contributeToGoal(
          mockGoalId,
          contributeDto,
          mockAuthUser,
        );

        // Assert
        expect(contributeGoalUseCase.execute).toHaveBeenCalledWith({
          goalId: mockGoalId,
          userId: mockUserId,
          amount: 123.45,
          name: 'Decimal contribution',
          description: undefined,
          recurring: undefined,
        });
        expect(result).toEqual(GoalResponseDto.fromEntity(mockGoalAggregate));
      });

      it('should handle zero recurring value', async () => {
        // Arrange
        const contributeDto: ContributeGoalDto = {
          amount: 100,
          recurring: 0,
        };

        const mockGoalAggregate = createMockGoalAggregate();
        contributeGoalUseCase.execute.mockResolvedValue(mockGoalAggregate);

        // Act
        const result = await controller.contributeToGoal(
          mockGoalId,
          contributeDto,
          mockAuthUser,
        );

        // Assert
        expect(contributeGoalUseCase.execute).toHaveBeenCalledWith({
          goalId: mockGoalId,
          userId: mockUserId,
          amount: contributeDto.amount,
          name: undefined,
          description: undefined,
          recurring: 0,
        });
        expect(result).toEqual(GoalResponseDto.fromEntity(mockGoalAggregate));
      });

      it('should handle empty string fields', async () => {
        // Arrange
        const contributeDto: ContributeGoalDto = {
          amount: 100,
          name: '',
          description: '',
        };

        const mockGoalAggregate = createMockGoalAggregate();
        contributeGoalUseCase.execute.mockResolvedValue(mockGoalAggregate);

        // Act
        const result = await controller.contributeToGoal(
          mockGoalId,
          contributeDto,
          mockAuthUser,
        );

        // Assert
        expect(contributeGoalUseCase.execute).toHaveBeenCalledWith({
          goalId: mockGoalId,
          userId: mockUserId,
          amount: contributeDto.amount,
          name: '',
          description: '',
          recurring: undefined,
        });
        expect(result).toEqual(GoalResponseDto.fromEntity(mockGoalAggregate));
      });
    });

    describe('error scenarios', () => {
      it('should propagate NotFoundException when goal is not found', async () => {
        // Arrange
        const contributeDto: ContributeGoalDto = {
          amount: 100,
        };

        const notFoundError = GoalErrorFactory.goalNotFound();
        contributeGoalUseCase.execute.mockRejectedValue(notFoundError);

        // Act & Assert
        await expect(
          controller.contributeToGoal(mockGoalId, contributeDto, mockAuthUser),
        ).rejects.toThrow(notFoundError);

        expect(contributeGoalUseCase.execute).toHaveBeenCalledWith({
          goalId: mockGoalId,
          userId: mockUserId,
          amount: contributeDto.amount,
          name: undefined,
          description: undefined,
          recurring: undefined,
        });
      });

      it('should propagate domain validation errors', async () => {
        // Arrange
        const contributeDto: ContributeGoalDto = {
          amount: 100,
        };

        const domainError = new Error('Contribution amount must be positive');
        contributeGoalUseCase.execute.mockRejectedValue(domainError);

        // Act & Assert
        await expect(
          controller.contributeToGoal(mockGoalId, contributeDto, mockAuthUser),
        ).rejects.toThrow(domainError);
      });

      it('should propagate use case errors', async () => {
        // Arrange
        const contributeDto: ContributeGoalDto = {
          amount: 100,
        };

        const useCaseError = new Error('Database connection failed');
        contributeGoalUseCase.execute.mockRejectedValue(useCaseError);

        // Act & Assert
        await expect(
          controller.contributeToGoal(mockGoalId, contributeDto, mockAuthUser),
        ).rejects.toThrow(useCaseError);
      });
    });

    describe('parameter validation', () => {
      it('should call use case with exact parameters', async () => {
        // Arrange
        const contributeDto: ContributeGoalDto = {
          amount: 999.99,
          name: 'Test contribution name',
          description: 'Test contribution description',
          recurring: 7,
        };

        const mockGoalAggregate = createMockGoalAggregate();
        contributeGoalUseCase.execute.mockResolvedValue(mockGoalAggregate);

        // Act
        await controller.contributeToGoal(
          mockGoalId,
          contributeDto,
          mockAuthUser,
        );

        // Assert
        expect(contributeGoalUseCase.execute).toHaveBeenCalledTimes(1);
        expect(contributeGoalUseCase.execute).toHaveBeenCalledWith({
          goalId: mockGoalId,
          userId: mockUserId,
          amount: 999.99,
          name: 'Test contribution name',
          description: 'Test contribution description',
          recurring: 7,
        });
      });

      it('should use correct goal ID from path parameter', async () => {
        // Arrange
        const customGoalId = 'custom-goal-789';
        const contributeDto: ContributeGoalDto = {
          amount: 100,
        };

        const mockGoalAggregate = createMockGoalAggregate(customGoalId);
        contributeGoalUseCase.execute.mockResolvedValue(mockGoalAggregate);

        // Act
        await controller.contributeToGoal(
          customGoalId,
          contributeDto,
          mockAuthUser,
        );

        // Assert
        expect(contributeGoalUseCase.execute).toHaveBeenCalledWith({
          goalId: customGoalId,
          userId: mockUserId,
          amount: contributeDto.amount,
          name: undefined,
          description: undefined,
          recurring: undefined,
        });
      });

      it('should use correct user ID from auth context', async () => {
        // Arrange
        const customAuthUser: AuthUser = {
          ...mockAuthUser,
          id: 'different-user-456',
        };
        const contributeDto: ContributeGoalDto = {
          amount: 100,
        };

        const mockGoalAggregate = createMockGoalAggregate(
          mockGoalId,
          'different-user-456',
        );
        contributeGoalUseCase.execute.mockResolvedValue(mockGoalAggregate);

        // Act
        await controller.contributeToGoal(
          mockGoalId,
          contributeDto,
          customAuthUser,
        );

        // Assert
        expect(contributeGoalUseCase.execute).toHaveBeenCalledWith({
          goalId: mockGoalId,
          userId: 'different-user-456',
          amount: contributeDto.amount,
          name: undefined,
          description: undefined,
          recurring: undefined,
        });
      });
    });
  });

  describe('withdrawFromGoal', () => {
    describe('successful withdrawals', () => {
      it('should withdraw from goal successfully with all fields', async () => {
        // Arrange
        const withdrawDto: WithdrawGoalDto = {
          amount: 50,
          name: 'Emergency withdrawal',
          description: 'Medical expense',
          recurring: 0,
        };

        const mockGoalAggregate = createMockGoalAggregate();
        withdrawGoalUseCase.execute.mockResolvedValue(mockGoalAggregate);

        // Act
        const result = await controller.withdrawFromGoal(
          mockGoalId,
          withdrawDto,
          mockAuthUser,
        );

        // Assert
        expect(withdrawGoalUseCase.execute).toHaveBeenCalledWith({
          goalId: mockGoalId,
          userId: mockUserId,
          amount: withdrawDto.amount,
          name: withdrawDto.name,
          description: withdrawDto.description,
          recurring: withdrawDto.recurring,
        });
        expect(result).toEqual(GoalResponseDto.fromEntity(mockGoalAggregate));
      });

      it('should withdraw from goal with minimal required fields', async () => {
        // Arrange
        const withdrawDto: WithdrawGoalDto = {
          amount: 25,
        };

        const mockGoalAggregate = createMockGoalAggregate();
        withdrawGoalUseCase.execute.mockResolvedValue(mockGoalAggregate);

        // Act
        const result = await controller.withdrawFromGoal(
          mockGoalId,
          withdrawDto,
          mockAuthUser,
        );

        // Assert
        expect(withdrawGoalUseCase.execute).toHaveBeenCalledWith({
          goalId: mockGoalId,
          userId: mockUserId,
          amount: withdrawDto.amount,
          name: undefined,
          description: undefined,
          recurring: undefined,
        });
        expect(result).toEqual(GoalResponseDto.fromEntity(mockGoalAggregate));
      });

      it('should handle decimal withdrawal amounts', async () => {
        // Arrange
        const withdrawDto: WithdrawGoalDto = {
          amount: 75.5,
          name: 'Decimal withdrawal',
        };

        const mockGoalAggregate = createMockGoalAggregate();
        withdrawGoalUseCase.execute.mockResolvedValue(mockGoalAggregate);

        // Act
        const result = await controller.withdrawFromGoal(
          mockGoalId,
          withdrawDto,
          mockAuthUser,
        );

        // Assert
        expect(withdrawGoalUseCase.execute).toHaveBeenCalledWith({
          goalId: mockGoalId,
          userId: mockUserId,
          amount: 75.5,
          name: 'Decimal withdrawal',
          description: undefined,
          recurring: undefined,
        });
        expect(result).toEqual(GoalResponseDto.fromEntity(mockGoalAggregate));
      });

      it('should handle zero recurring value explicitly', async () => {
        // Arrange
        const withdrawDto: WithdrawGoalDto = {
          amount: 100,
          recurring: 0,
        };

        const mockGoalAggregate = createMockGoalAggregate();
        withdrawGoalUseCase.execute.mockResolvedValue(mockGoalAggregate);

        // Act
        const result = await controller.withdrawFromGoal(
          mockGoalId,
          withdrawDto,
          mockAuthUser,
        );

        // Assert
        expect(withdrawGoalUseCase.execute).toHaveBeenCalledWith({
          goalId: mockGoalId,
          userId: mockUserId,
          amount: withdrawDto.amount,
          name: undefined,
          description: undefined,
          recurring: 0,
        });
        expect(result).toEqual(GoalResponseDto.fromEntity(mockGoalAggregate));
      });

      it('should handle empty string fields', async () => {
        // Arrange
        const withdrawDto: WithdrawGoalDto = {
          amount: 100,
          name: '',
          description: '',
        };

        const mockGoalAggregate = createMockGoalAggregate();
        withdrawGoalUseCase.execute.mockResolvedValue(mockGoalAggregate);

        // Act
        const result = await controller.withdrawFromGoal(
          mockGoalId,
          withdrawDto,
          mockAuthUser,
        );

        // Assert
        expect(withdrawGoalUseCase.execute).toHaveBeenCalledWith({
          goalId: mockGoalId,
          userId: mockUserId,
          amount: withdrawDto.amount,
          name: '',
          description: '',
          recurring: undefined,
        });
        expect(result).toEqual(GoalResponseDto.fromEntity(mockGoalAggregate));
      });
    });

    describe('insufficient balance scenarios', () => {
      it('should propagate GOAL_INSUFFICIENT_BALANCE error', async () => {
        // Arrange
        const withdrawDto: WithdrawGoalDto = {
          amount: 150,
        };

        const insufficientBalanceError =
          GoalErrorFactory.goalInsufficientBalance(150, 100);
        withdrawGoalUseCase.execute.mockRejectedValue(insufficientBalanceError);

        // Act & Assert
        await expect(
          controller.withdrawFromGoal(mockGoalId, withdrawDto, mockAuthUser),
        ).rejects.toThrow(insufficientBalanceError);

        expect(withdrawGoalUseCase.execute).toHaveBeenCalledWith({
          goalId: mockGoalId,
          userId: mockUserId,
          amount: withdrawDto.amount,
          name: undefined,
          description: undefined,
          recurring: undefined,
        });
      });

      it('should propagate insufficient balance error with correct amounts', async () => {
        // Arrange
        const withdrawDto: WithdrawGoalDto = {
          amount: 100.01,
        };

        const insufficientBalanceError =
          GoalErrorFactory.goalInsufficientBalance(100.01, 100.0);
        withdrawGoalUseCase.execute.mockRejectedValue(insufficientBalanceError);

        // Act & Assert
        await expect(
          controller.withdrawFromGoal(mockGoalId, withdrawDto, mockAuthUser),
        ).rejects.toThrow(insufficientBalanceError);
      });

      it('should propagate insufficient balance error when trying to withdraw from zero balance', async () => {
        // Arrange
        const withdrawDto: WithdrawGoalDto = {
          amount: 0.01,
        };

        const insufficientBalanceError =
          GoalErrorFactory.goalInsufficientBalance(0.01, 0);
        withdrawGoalUseCase.execute.mockRejectedValue(insufficientBalanceError);

        // Act & Assert
        await expect(
          controller.withdrawFromGoal(mockGoalId, withdrawDto, mockAuthUser),
        ).rejects.toThrow(insufficientBalanceError);
      });
    });

    describe('error scenarios', () => {
      it('should propagate NotFoundException when goal is not found', async () => {
        // Arrange
        const withdrawDto: WithdrawGoalDto = {
          amount: 50,
        };

        const notFoundError = GoalErrorFactory.goalNotFound();
        withdrawGoalUseCase.execute.mockRejectedValue(notFoundError);

        // Act & Assert
        await expect(
          controller.withdrawFromGoal(mockGoalId, withdrawDto, mockAuthUser),
        ).rejects.toThrow(notFoundError);

        expect(withdrawGoalUseCase.execute).toHaveBeenCalledWith({
          goalId: mockGoalId,
          userId: mockUserId,
          amount: withdrawDto.amount,
          name: undefined,
          description: undefined,
          recurring: undefined,
        });
      });

      it('should propagate domain validation errors', async () => {
        // Arrange
        const withdrawDto: WithdrawGoalDto = {
          amount: 50,
        };

        const domainError = new Error('Withdrawal amount must be positive');
        withdrawGoalUseCase.execute.mockRejectedValue(domainError);

        // Act & Assert
        await expect(
          controller.withdrawFromGoal(mockGoalId, withdrawDto, mockAuthUser),
        ).rejects.toThrow(domainError);
      });

      it('should propagate use case errors', async () => {
        // Arrange
        const withdrawDto: WithdrawGoalDto = {
          amount: 50,
        };

        const useCaseError = new Error('Database connection failed');
        withdrawGoalUseCase.execute.mockRejectedValue(useCaseError);

        // Act & Assert
        await expect(
          controller.withdrawFromGoal(mockGoalId, withdrawDto, mockAuthUser),
        ).rejects.toThrow(useCaseError);
      });
    });

    describe('parameter validation', () => {
      it('should call use case with exact parameters', async () => {
        // Arrange
        const withdrawDto: WithdrawGoalDto = {
          amount: 333.33,
          name: 'Test withdrawal name',
          description: 'Test withdrawal description',
          recurring: 0,
        };

        const mockGoalAggregate = createMockGoalAggregate();
        withdrawGoalUseCase.execute.mockResolvedValue(mockGoalAggregate);

        // Act
        await controller.withdrawFromGoal(
          mockGoalId,
          withdrawDto,
          mockAuthUser,
        );

        // Assert
        expect(withdrawGoalUseCase.execute).toHaveBeenCalledTimes(1);
        expect(withdrawGoalUseCase.execute).toHaveBeenCalledWith({
          goalId: mockGoalId,
          userId: mockUserId,
          amount: 333.33,
          name: 'Test withdrawal name',
          description: 'Test withdrawal description',
          recurring: 0,
        });
      });

      it('should use correct goal ID from path parameter', async () => {
        // Arrange
        const customGoalId = 'custom-goal-withdraw-123';
        const withdrawDto: WithdrawGoalDto = {
          amount: 50,
        };

        const mockGoalAggregate = createMockGoalAggregate(customGoalId);
        withdrawGoalUseCase.execute.mockResolvedValue(mockGoalAggregate);

        // Act
        await controller.withdrawFromGoal(
          customGoalId,
          withdrawDto,
          mockAuthUser,
        );

        // Assert
        expect(withdrawGoalUseCase.execute).toHaveBeenCalledWith({
          goalId: customGoalId,
          userId: mockUserId,
          amount: withdrawDto.amount,
          name: undefined,
          description: undefined,
          recurring: undefined,
        });
      });

      it('should use correct user ID from auth context', async () => {
        // Arrange
        const customAuthUser: AuthUser = {
          ...mockAuthUser,
          id: 'different-withdraw-user-789',
        };
        const withdrawDto: WithdrawGoalDto = {
          amount: 50,
        };

        const mockGoalAggregate = createMockGoalAggregate(
          mockGoalId,
          'different-withdraw-user-789',
        );
        withdrawGoalUseCase.execute.mockResolvedValue(mockGoalAggregate);

        // Act
        await controller.withdrawFromGoal(
          mockGoalId,
          withdrawDto,
          customAuthUser,
        );

        // Assert
        expect(withdrawGoalUseCase.execute).toHaveBeenCalledWith({
          goalId: mockGoalId,
          userId: 'different-withdraw-user-789',
          amount: withdrawDto.amount,
          name: undefined,
          description: undefined,
          recurring: undefined,
        });
      });
    });
  });

  describe('integration between contribute and withdraw', () => {
    it('should handle both operations with same goal ID', async () => {
      // Arrange
      const contributeDto: ContributeGoalDto = {
        amount: 200,
        name: 'Initial contribution',
      };

      const withdrawDto: WithdrawGoalDto = {
        amount: 50,
        name: 'Partial withdrawal',
      };

      const mockGoalAggregate = createMockGoalAggregate();
      contributeGoalUseCase.execute.mockResolvedValue(mockGoalAggregate);
      withdrawGoalUseCase.execute.mockResolvedValue(mockGoalAggregate);

      // Act
      const contributeResult = await controller.contributeToGoal(
        mockGoalId,
        contributeDto,
        mockAuthUser,
      );
      const withdrawResult = await controller.withdrawFromGoal(
        mockGoalId,
        withdrawDto,
        mockAuthUser,
      );

      // Assert
      expect(contributeResult).toEqual(
        GoalResponseDto.fromEntity(mockGoalAggregate),
      );
      expect(withdrawResult).toEqual(
        GoalResponseDto.fromEntity(mockGoalAggregate),
      );

      expect(contributeGoalUseCase.execute).toHaveBeenCalledWith({
        goalId: mockGoalId,
        userId: mockUserId,
        amount: 200,
        name: 'Initial contribution',
        description: undefined,
        recurring: undefined,
      });

      expect(withdrawGoalUseCase.execute).toHaveBeenCalledWith({
        goalId: mockGoalId,
        userId: mockUserId,
        amount: 50,
        name: 'Partial withdrawal',
        description: undefined,
        recurring: undefined,
      });
    });

    it('should maintain separate error handling for each operation', async () => {
      // Arrange
      const contributeDto: ContributeGoalDto = {
        amount: 100,
      };

      const withdrawDto: WithdrawGoalDto = {
        amount: 200,
      };

      const mockGoalAggregate = createMockGoalAggregate();
      contributeGoalUseCase.execute.mockResolvedValue(mockGoalAggregate);
      withdrawGoalUseCase.execute.mockRejectedValue(
        GoalErrorFactory.goalInsufficientBalance(200, 100),
      );

      // Act & Assert
      // Contribute should succeed
      const contributeResult = await controller.contributeToGoal(
        mockGoalId,
        contributeDto,
        mockAuthUser,
      );
      expect(contributeResult).toEqual(
        GoalResponseDto.fromEntity(mockGoalAggregate),
      );

      // Withdraw should fail with insufficient balance
      await expect(
        controller.withdrawFromGoal(mockGoalId, withdrawDto, mockAuthUser),
      ).rejects.toThrow(GoalErrorFactory.goalInsufficientBalance(200, 100));
    });
  });

  describe('response format validation', () => {
    it('should return properly formatted GoalResponseDto for contributions', async () => {
      // Arrange
      const contributeDto: ContributeGoalDto = {
        amount: 100,
      };

      const mockGoalAggregate = createMockGoalAggregate();
      contributeGoalUseCase.execute.mockResolvedValue(mockGoalAggregate);

      // Act
      const result = await controller.contributeToGoal(
        mockGoalId,
        contributeDto,
        mockAuthUser,
      );

      // Assert
      expect(result).toEqual(GoalResponseDto.fromEntity(mockGoalAggregate));
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('targetAmount');
      expect(result).toHaveProperty('currentAmount');
      expect(result).toHaveProperty('contributions');
    });

    it('should return properly formatted GoalResponseDto for withdrawals', async () => {
      // Arrange
      const withdrawDto: WithdrawGoalDto = {
        amount: 50,
      };

      const mockGoalAggregate = createMockGoalAggregate();
      withdrawGoalUseCase.execute.mockResolvedValue(mockGoalAggregate);

      // Act
      const result = await controller.withdrawFromGoal(
        mockGoalId,
        withdrawDto,
        mockAuthUser,
      );

      // Assert
      expect(result).toEqual(GoalResponseDto.fromEntity(mockGoalAggregate));
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('targetAmount');
      expect(result).toHaveProperty('currentAmount');
      expect(result).toHaveProperty('contributions');
    });
  });
});
