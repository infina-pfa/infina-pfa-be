import { CurrencyVO } from '@/common/base';
import {
  GoalAggregate,
  GoalAggregateRepository,
  GoalEntity,
  GoalErrorFactory,
} from '@/goals/domain';
import { GoalTransactionsWatchList } from '@/goals/domain/watch-list/goal-transactions.watch-list';
import { Test, TestingModule } from '@nestjs/testing';
import { UpdateGoalUseCase } from '../update-goal.use-case';

describe('UpdateGoalUseCase', () => {
  let useCase: UpdateGoalUseCase;
  let goalAggregateRepository: jest.Mocked<GoalAggregateRepository>;

  beforeEach(async () => {
    const goalAggregateRepositoryMock = {
      findOne: jest.fn(),
      save: jest.fn(),
      findById: jest.fn(),
      findMany: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateGoalUseCase,
        {
          provide: GoalAggregateRepository,
          useValue: goalAggregateRepositoryMock,
        },
      ],
    }).compile();

    useCase = module.get<UpdateGoalUseCase>(UpdateGoalUseCase);
    goalAggregateRepository = module.get(GoalAggregateRepository);
  });

  describe('execute', () => {
    const userId = 'user-123';
    const goalId = 'goal-456';

    // Create a mock goal aggregate
    const createMockGoalAggregate = (overrides: any = {}) => {
      const goalEntity = GoalEntity.create(
        {
          userId,
          title: 'Original Goal',
          description: 'Original description',
          targetAmount: new CurrencyVO(1000),
          dueDate: new Date('2025-12-31'),
          ...overrides.goalProps,
        },
        goalId,
      );

      const mockAggregate = {
        id: goalId,
        userId,
        props: {
          goal: goalEntity,
          contributions: new GoalTransactionsWatchList([]),
          createdAt: new Date('2025-01-01'),
          updatedAt: new Date('2025-01-01'),
        },
        updateGoalDetails: jest.fn(),
        validate: jest.fn(),
        ...overrides,
      } as unknown as GoalAggregate;

      return mockAggregate;
    };

    describe('Success Cases', () => {
      it('should update goal title successfully', async () => {
        // Arrange
        const mockGoalAggregate = createMockGoalAggregate();
        goalAggregateRepository.findById.mockResolvedValue(mockGoalAggregate);
        goalAggregateRepository.findOne.mockResolvedValue(null); // No duplicate title
        goalAggregateRepository.save.mockResolvedValue(undefined);

        const input = {
          id: goalId,
          userId,
          props: { title: 'Updated Goal Title' },
        };

        // Act
        const result = await useCase.execute(input);

        // Assert
        expect(goalAggregateRepository.findById).toHaveBeenCalledWith(goalId);
        expect(goalAggregateRepository.findOne).toHaveBeenCalledWith({
          title: input.props.title,
          userId,
        });
        expect(mockGoalAggregate.updateGoalDetails).toHaveBeenCalledWith(
          input.props,
        );
        expect(goalAggregateRepository.save).toHaveBeenCalledWith(
          mockGoalAggregate,
        );
        expect(result).toBe(mockGoalAggregate);
      });

      it('should update target amount successfully', async () => {
        // Arrange
        const mockGoalAggregate = createMockGoalAggregate();
        goalAggregateRepository.findById.mockResolvedValue(mockGoalAggregate);
        goalAggregateRepository.save.mockResolvedValue(undefined);

        const input = {
          id: goalId,
          userId,
          props: { targetAmount: new CurrencyVO(2000) },
        };

        // Act
        const result = await useCase.execute(input);

        // Assert
        expect(goalAggregateRepository.findById).toHaveBeenCalledWith(goalId);
        expect(goalAggregateRepository.findOne).not.toHaveBeenCalled(); // No title check
        expect(mockGoalAggregate.updateGoalDetails).toHaveBeenCalledWith(
          input.props,
        );
        expect(goalAggregateRepository.save).toHaveBeenCalledWith(
          mockGoalAggregate,
        );
        expect(result).toBe(mockGoalAggregate);
      });

      it('should update description and due date successfully', async () => {
        // Arrange
        const mockGoalAggregate = createMockGoalAggregate();
        goalAggregateRepository.findById.mockResolvedValue(mockGoalAggregate);
        goalAggregateRepository.save.mockResolvedValue(undefined);

        const newDueDate = new Date('2026-06-30');
        const input = {
          id: goalId,
          userId,
          props: {
            description: 'Updated description',
            dueDate: newDueDate,
          },
        };

        // Act
        const result = await useCase.execute(input);

        // Assert
        expect(goalAggregateRepository.findById).toHaveBeenCalledWith(goalId);
        expect(goalAggregateRepository.findOne).not.toHaveBeenCalled(); // No title check
        expect(mockGoalAggregate.updateGoalDetails).toHaveBeenCalledWith(
          input.props,
        );
        expect(goalAggregateRepository.save).toHaveBeenCalledWith(
          mockGoalAggregate,
        );
        expect(result).toBe(mockGoalAggregate);
      });

      it('should handle partial updates (only some fields)', async () => {
        // Arrange
        const mockGoalAggregate = createMockGoalAggregate();
        goalAggregateRepository.findById.mockResolvedValue(mockGoalAggregate);
        goalAggregateRepository.findOne.mockResolvedValue(null);
        goalAggregateRepository.save.mockResolvedValue(undefined);

        const input = {
          id: goalId,
          userId,
          props: {
            title: 'Partially Updated',
            targetAmount: new CurrencyVO(1500),
            // description and dueDate not included
          },
        };

        // Act
        const result = await useCase.execute(input);

        // Assert
        expect(goalAggregateRepository.findById).toHaveBeenCalledWith(goalId);
        expect(goalAggregateRepository.findOne).toHaveBeenCalledWith({
          title: input.props.title,
          userId,
        });
        expect(mockGoalAggregate.updateGoalDetails).toHaveBeenCalledWith(
          input.props,
        );
        expect(goalAggregateRepository.save).toHaveBeenCalledWith(
          mockGoalAggregate,
        );
        expect(result).toBe(mockGoalAggregate);
      });

      it('should update title to same title (should pass)', async () => {
        // Arrange
        const mockGoalAggregate = createMockGoalAggregate();
        goalAggregateRepository.findById.mockResolvedValue(mockGoalAggregate);
        goalAggregateRepository.findOne.mockResolvedValue(mockGoalAggregate); // Same goal found
        goalAggregateRepository.save.mockResolvedValue(undefined);

        const input = {
          id: goalId,
          userId,
          props: { title: 'Original Goal' }, // Same as current title
        };

        // Act
        const result = await useCase.execute(input);

        // Assert
        expect(goalAggregateRepository.findById).toHaveBeenCalledWith(goalId);
        expect(goalAggregateRepository.findOne).toHaveBeenCalledWith({
          title: input.props.title,
          userId,
        });
        expect(mockGoalAggregate.updateGoalDetails).toHaveBeenCalledWith(
          input.props,
        );
        expect(goalAggregateRepository.save).toHaveBeenCalledWith(
          mockGoalAggregate,
        );
        expect(result).toBe(mockGoalAggregate);
      });
    });

    describe('Validation Cases', () => {
      it('should throw NotFoundException when goal not found', async () => {
        // Arrange
        goalAggregateRepository.findById.mockResolvedValue(null);

        const input = {
          id: goalId,
          userId,
          props: { title: 'Updated Title' },
        };

        // Act & Assert
        await expect(useCase.execute(input)).rejects.toThrow(
          GoalErrorFactory.goalNotFound(),
        );
        expect(goalAggregateRepository.findOne).not.toHaveBeenCalled();
        expect(goalAggregateRepository.save).not.toHaveBeenCalled();
      });

      it('should throw NotFoundException when user does not own goal (security)', async () => {
        // Arrange
        const mockGoalAggregate = createMockGoalAggregate({
          userId: 'different-user-789', // Different user
        });
        goalAggregateRepository.findById.mockResolvedValue(mockGoalAggregate);

        const input = {
          id: goalId,
          userId,
          props: { title: 'Updated Title' },
        };

        // Act & Assert
        await expect(useCase.execute(input)).rejects.toThrow(
          GoalErrorFactory.goalNotFound(),
        );
        expect(goalAggregateRepository.findOne).not.toHaveBeenCalled();
        expect(goalAggregateRepository.save).not.toHaveBeenCalled();
      });

      it('should throw ConflictException when duplicate title with another users goal', async () => {
        // Arrange
        const mockGoalAggregate = createMockGoalAggregate();
        const differentGoalAggregate = createMockGoalAggregate({
          id: 'different-goal-789',
        });

        goalAggregateRepository.findById.mockResolvedValue(mockGoalAggregate);
        goalAggregateRepository.findOne.mockResolvedValue(
          differentGoalAggregate,
        ); // Different goal with same title

        const input = {
          id: goalId,
          userId,
          props: { title: 'Duplicate Title' },
        };

        // Act & Assert
        await expect(useCase.execute(input)).rejects.toThrow(
          GoalErrorFactory.goalTitleAlreadyExists(input.props.title),
        );
        expect(goalAggregateRepository.save).not.toHaveBeenCalled();
      });

      it('should throw BadRequestException when empty title (GoalEntity.validate)', async () => {
        // Arrange
        const mockGoalAggregate = createMockGoalAggregate();
        mockGoalAggregate.updateGoalDetails = jest.fn().mockImplementation(() => {
          throw GoalErrorFactory.invalidGoal('Title is required');
        });

        goalAggregateRepository.findById.mockResolvedValue(mockGoalAggregate);
        goalAggregateRepository.findOne.mockResolvedValue(null);

        const input = {
          id: goalId,
          userId,
          props: { title: '' },
        };

        // Act & Assert
        await expect(useCase.execute(input)).rejects.toThrow(
          GoalErrorFactory.invalidGoal('Title is required'),
        );
        expect(goalAggregateRepository.save).not.toHaveBeenCalled();
      });

      it('should throw BadRequestException when missing target amount (GoalEntity.validate)', async () => {
        // Arrange
        const mockGoalAggregate = createMockGoalAggregate();
        mockGoalAggregate.updateGoalDetails = jest.fn().mockImplementation(() => {
          throw GoalErrorFactory.invalidGoal('Target amount is required');
        });

        goalAggregateRepository.findById.mockResolvedValue(mockGoalAggregate);
        goalAggregateRepository.save.mockResolvedValue(undefined);

        const input = {
          id: goalId,
          userId,
          props: { targetAmount: undefined },
        };

        // Act & Assert
        await expect(useCase.execute(input)).rejects.toThrow(
          GoalErrorFactory.invalidGoal('Target amount is required'),
        );
        expect(goalAggregateRepository.save).not.toHaveBeenCalled();
      });

      it('should throw BadRequestException when invalid target amount ≤ 0 (GoalEntity.validate)', async () => {
        // Arrange
        const mockGoalAggregate = createMockGoalAggregate();
        mockGoalAggregate.updateGoalDetails = jest.fn().mockImplementation(() => {
          throw GoalErrorFactory.invalidGoal('Target amount must be positive');
        });

        goalAggregateRepository.findById.mockResolvedValue(mockGoalAggregate);
        goalAggregateRepository.save.mockResolvedValue(undefined);

        const input = {
          id: goalId,
          userId,
          props: { targetAmount: new CurrencyVO(0) },
        };

        // Act & Assert
        await expect(useCase.execute(input)).rejects.toThrow(
          GoalErrorFactory.invalidGoal('Target amount must be positive'),
        );
        expect(goalAggregateRepository.save).not.toHaveBeenCalled();
      });

      it('should throw BadRequestException when past due date (GoalEntity.validate)', async () => {
        // Arrange
        const mockGoalAggregate = createMockGoalAggregate();
        mockGoalAggregate.updateGoalDetails = jest.fn().mockImplementation(() => {
          throw GoalErrorFactory.invalidGoal('Due date must be in the future');
        });

        goalAggregateRepository.findById.mockResolvedValue(mockGoalAggregate);
        goalAggregateRepository.save.mockResolvedValue(undefined);

        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 1);

        const input = {
          id: goalId,
          userId,
          props: { dueDate: pastDate },
        };

        // Act & Assert
        await expect(useCase.execute(input)).rejects.toThrow(
          GoalErrorFactory.invalidGoal('Due date must be in the future'),
        );
        expect(goalAggregateRepository.save).not.toHaveBeenCalled();
      });
    });

    describe('Edge Cases', () => {
      it('should handle repository findById failures', async () => {
        // Arrange
        const repositoryError = new Error('Database connection failed');
        goalAggregateRepository.findById.mockRejectedValue(repositoryError);

        const input = {
          id: goalId,
          userId,
          props: { title: 'Updated Title' },
        };

        // Act & Assert
        await expect(useCase.execute(input)).rejects.toThrow(repositoryError);
        expect(goalAggregateRepository.findOne).not.toHaveBeenCalled();
        expect(goalAggregateRepository.save).not.toHaveBeenCalled();
      });

      it('should handle repository findOne failures', async () => {
        // Arrange
        const mockGoalAggregate = createMockGoalAggregate();
        goalAggregateRepository.findById.mockResolvedValue(mockGoalAggregate);

        const repositoryError = new Error('Database query failed');
        goalAggregateRepository.findOne.mockRejectedValue(repositoryError);

        const input = {
          id: goalId,
          userId,
          props: { title: 'Updated Title' },
        };

        // Act & Assert
        await expect(useCase.execute(input)).rejects.toThrow(repositoryError);
        expect(goalAggregateRepository.save).not.toHaveBeenCalled();
      });

      it('should handle repository save failures', async () => {
        // Arrange
        const mockGoalAggregate = createMockGoalAggregate();
        goalAggregateRepository.findById.mockResolvedValue(mockGoalAggregate);
        goalAggregateRepository.findOne.mockResolvedValue(null);

        const repositoryError = new Error('Database save failed');
        goalAggregateRepository.save.mockRejectedValue(repositoryError);

        const input = {
          id: goalId,
          userId,
          props: { title: 'Updated Title' },
        };

        // Act & Assert
        await expect(useCase.execute(input)).rejects.toThrow(repositoryError);
        expect(mockGoalAggregate.updateGoalDetails).toHaveBeenCalled();
      });

      it('should handle validation errors from domain layer', async () => {
        // Arrange
        const mockGoalAggregate = createMockGoalAggregate();
        const validationError = GoalErrorFactory.invalidGoal(
          'Custom validation error',
        );
        mockGoalAggregate.updateGoalDetails = jest.fn().mockImplementation(() => {
          throw validationError;
        });

        goalAggregateRepository.findById.mockResolvedValue(mockGoalAggregate);
        goalAggregateRepository.findOne.mockResolvedValue(null);

        const input = {
          id: goalId,
          userId,
          props: { title: 'Updated Title' },
        };

        // Act & Assert
        await expect(useCase.execute(input)).rejects.toThrow(validationError);
        expect(mockGoalAggregate.updateGoalDetails).toHaveBeenCalledWith(input.props);
        expect(goalAggregateRepository.save).not.toHaveBeenCalled();
      });

      it('should not call findOne when no title is provided', async () => {
        // Arrange
        const mockGoalAggregate = createMockGoalAggregate();
        goalAggregateRepository.findById.mockResolvedValue(mockGoalAggregate);
        goalAggregateRepository.save.mockResolvedValue(undefined);

        const input = {
          id: goalId,
          userId,
          props: {
            description: 'Updated description only',
            targetAmount: new CurrencyVO(1500),
          },
        };

        // Act
        const result = await useCase.execute(input);

        // Assert
        expect(goalAggregateRepository.findById).toHaveBeenCalledWith(goalId);
        expect(goalAggregateRepository.findOne).not.toHaveBeenCalled(); // Should not check for duplicate title
        expect(mockGoalAggregate.updateGoalDetails).toHaveBeenCalledWith(
          input.props,
        );
        expect(result).toBe(mockGoalAggregate);
      });

      it('should handle empty props object', async () => {
        // Arrange
        const mockGoalAggregate = createMockGoalAggregate();
        goalAggregateRepository.findById.mockResolvedValue(mockGoalAggregate);
        goalAggregateRepository.save.mockResolvedValue(undefined);

        const input = {
          id: goalId,
          userId,
          props: {}, // Empty props
        };

        // Act
        const result = await useCase.execute(input);

        // Assert
        expect(goalAggregateRepository.findById).toHaveBeenCalledWith(goalId);
        expect(goalAggregateRepository.findOne).not.toHaveBeenCalled();
        expect(mockGoalAggregate.updateGoalDetails).toHaveBeenCalledWith(
          input.props,
        );
        expect(goalAggregateRepository.save).toHaveBeenCalledWith(
          mockGoalAggregate,
        );
        expect(result).toBe(mockGoalAggregate);
      });
    });

    describe('Repository Method Call Verification', () => {
      it('should verify exact repository method calls for complete update', async () => {
        // Arrange
        const mockGoalAggregate = createMockGoalAggregate();
        goalAggregateRepository.findById.mockResolvedValue(mockGoalAggregate);
        goalAggregateRepository.findOne.mockResolvedValue(null);
        goalAggregateRepository.save.mockResolvedValue(undefined);

        const input = {
          id: goalId,
          userId,
          props: {
            title: 'Complete Update',
            description: 'Updated description',
            targetAmount: new CurrencyVO(3000),
            dueDate: new Date('2026-12-31'),
          },
        };

        // Act
        await useCase.execute(input);

        // Assert
        expect(goalAggregateRepository.findById).toHaveBeenCalledTimes(1);
        expect(goalAggregateRepository.findById).toHaveBeenCalledWith(goalId);

        expect(goalAggregateRepository.findOne).toHaveBeenCalledTimes(1);
        expect(goalAggregateRepository.findOne).toHaveBeenCalledWith({
          title: input.props.title,
          userId,
        });

        expect(goalAggregateRepository.save).toHaveBeenCalledTimes(1);
        expect(goalAggregateRepository.save).toHaveBeenCalledWith(
          mockGoalAggregate,
        );

        expect(mockGoalAggregate.updateGoalDetails).toHaveBeenCalledTimes(1);
        expect(mockGoalAggregate.updateGoalDetails).toHaveBeenCalledWith(
          input.props,
        );
      });

      it('should verify method calls when only non-title fields are updated', async () => {
        // Arrange
        const mockGoalAggregate = createMockGoalAggregate();
        goalAggregateRepository.findById.mockResolvedValue(mockGoalAggregate);
        goalAggregateRepository.save.mockResolvedValue(undefined);

        const input = {
          id: goalId,
          userId,
          props: {
            description: 'New description',
            targetAmount: new CurrencyVO(2500),
          },
        };

        // Act
        await useCase.execute(input);

        // Assert
        expect(goalAggregateRepository.findById).toHaveBeenCalledTimes(1);
        expect(goalAggregateRepository.findOne).toHaveBeenCalledTimes(0); // Should not check for duplicate title
        expect(goalAggregateRepository.save).toHaveBeenCalledTimes(1);
        expect(mockGoalAggregate.updateGoalDetails).toHaveBeenCalledTimes(1);
      });
    });

    describe('Input Type Validation', () => {
      it('should handle CurrencyVO target amounts correctly', async () => {
        // Arrange
        const mockGoalAggregate = createMockGoalAggregate();
        goalAggregateRepository.findById.mockResolvedValue(mockGoalAggregate);
        goalAggregateRepository.save.mockResolvedValue(undefined);

        const currencyAmount = new CurrencyVO(1234.56);
        const input = {
          id: goalId,
          userId,
          props: { targetAmount: currencyAmount },
        };

        // Act
        const result = await useCase.execute(input);

        // Assert
        expect(mockGoalAggregate.updateGoalDetails).toHaveBeenCalledWith({
          targetAmount: currencyAmount,
        });
        expect(result).toBe(mockGoalAggregate);
      });

      it('should handle Date objects for dueDate correctly', async () => {
        // Arrange
        const mockGoalAggregate = createMockGoalAggregate();
        goalAggregateRepository.findById.mockResolvedValue(mockGoalAggregate);
        goalAggregateRepository.save.mockResolvedValue(undefined);

        const futureDate = new Date('2027-03-15T10:30:00Z');
        const input = {
          id: goalId,
          userId,
          props: { dueDate: futureDate },
        };

        // Act
        const result = await useCase.execute(input);

        // Assert
        expect(mockGoalAggregate.updateGoalDetails).toHaveBeenCalledWith({
          dueDate: futureDate,
        });
        expect(result).toBe(mockGoalAggregate);
      });
    });

    describe('Security Tests', () => {
      it('should prevent access to goals from different users', async () => {
        // Arrange
        const mockGoalAggregate = createMockGoalAggregate({
          userId: 'malicious-user-999',
        });
        goalAggregateRepository.findById.mockResolvedValue(mockGoalAggregate);

        const input = {
          id: goalId,
          userId: 'legitimate-user-123',
          props: { title: 'Hacked Goal' },
        };

        // Act & Assert
        await expect(useCase.execute(input)).rejects.toThrow(
          GoalErrorFactory.goalNotFound(),
        );
        expect(goalAggregateRepository.findOne).not.toHaveBeenCalled();
        expect(goalAggregateRepository.save).not.toHaveBeenCalled();
      });

      it('should handle null userId gracefully', async () => {
        // Arrange
        const mockGoalAggregate = createMockGoalAggregate({
          userId: null,
        });
        goalAggregateRepository.findById.mockResolvedValue(mockGoalAggregate);

        const input = {
          id: goalId,
          userId,
          props: { title: 'Updated Title' },
        };

        // Act & Assert
        await expect(useCase.execute(input)).rejects.toThrow(
          GoalErrorFactory.goalNotFound(),
        );
      });
    });
  });
});
