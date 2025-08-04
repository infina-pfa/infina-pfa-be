import { Test, TestingModule } from '@nestjs/testing';
import { GetGoalsUseCase, GetGoalsUseCaseInput } from '../get-goals.use-case';
import { GoalAggregateRepository, GoalAggregate } from '@/goals/domain';
import { GoalEntity } from '@/goals/domain/entities/goal.entity';
import { GoalTransactionsWatchList } from '@/goals/domain/watch-list/goal-transactions.watch-list';
import { CurrencyVO } from '@/common/base';
import { Currency } from '@/common/types';

describe('GetGoalsUseCase', () => {
  let useCase: GetGoalsUseCase;
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
        GetGoalsUseCase,
        {
          provide: GoalAggregateRepository,
          useValue: goalAggregateRepositoryMock,
        },
      ],
    }).compile();

    useCase = module.get<GetGoalsUseCase>(GetGoalsUseCase);
    goalAggregateRepository = module.get(GoalAggregateRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const validInput: GetGoalsUseCaseInput = {
      userId: 'user-123',
    };

    const mockDate = new Date('2025-01-01T00:00:00Z');
    const mockUpdateDate = new Date('2025-01-02T00:00:00Z');

    const createMockGoalAggregate = (overrides: Partial<any> = {}): GoalAggregate => {
      const goalEntity = GoalEntity.create({
        userId: 'user-123',
        title: 'Save for vacation',
        description: 'Save money for a vacation to Japan',
        targetAmount: new CurrencyVO(5000, Currency.VND),
        dueDate: new Date('2025-12-31'),
        currentAmount: new CurrencyVO(1000, Currency.VND),
        createdAt: mockDate,
        updatedAt: mockUpdateDate,
        ...overrides,
      });

      const contributions = new GoalTransactionsWatchList([]);

      return GoalAggregate.create({
        goal: goalEntity,
        contributions,
      });
    };

    it('should successfully retrieve user goals', async () => {
      // Arrange
      const mockGoals = [
        createMockGoalAggregate({ title: 'Goal 1' }),
        createMockGoalAggregate({ title: 'Goal 2' }),
      ];
      goalAggregateRepository.findMany.mockResolvedValue(mockGoals);

      // Act
      const result = await useCase.execute(validInput);

      // Assert
      expect(goalAggregateRepository.findMany).toHaveBeenCalledWith({
        userId: validInput.userId,
      });
      expect(goalAggregateRepository.findMany).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockGoals);
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(GoalAggregate);
      expect(result[1]).toBeInstanceOf(GoalAggregate);
    });

    it('should return empty array when user has no goals', async () => {
      // Arrange
      goalAggregateRepository.findMany.mockResolvedValue([]);

      // Act
      const result = await useCase.execute(validInput);

      // Assert
      expect(goalAggregateRepository.findMany).toHaveBeenCalledWith({
        userId: validInput.userId,
      });
      expect(goalAggregateRepository.findMany).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should call repository method with correct userId', async () => {
      // Arrange
      const testUserId = 'different-user-456';
      const inputWithDifferentUser: GetGoalsUseCaseInput = {
        userId: testUserId,
      };
      goalAggregateRepository.findMany.mockResolvedValue([]);

      // Act
      await useCase.execute(inputWithDifferentUser);

      // Assert
      expect(goalAggregateRepository.findMany).toHaveBeenCalledWith({
        userId: testUserId,
      });
      expect(goalAggregateRepository.findMany).toHaveBeenCalledTimes(1);
    });

    it('should return proper GoalAggregate entities with correct structure', async () => {
      // Arrange
      const mockGoal = createMockGoalAggregate({
        title: 'Test Goal',
        description: 'Test Description',
        targetAmount: new CurrencyVO(10000, Currency.VND),
        currentAmount: new CurrencyVO(2000, Currency.VND),
      });
      goalAggregateRepository.findMany.mockResolvedValue([mockGoal]);

      // Act
      const result = await useCase.execute(validInput);

      // Assert
      expect(result).toHaveLength(1);
      const returnedGoal = result[0];
      expect(returnedGoal).toBeInstanceOf(GoalAggregate);
      expect(returnedGoal.goal).toBeDefined();
      expect(returnedGoal.contributions).toBeDefined();
      expect(returnedGoal.goal.props.title).toBe('Test Goal');
      expect(returnedGoal.goal.props.description).toBe('Test Description');
      expect(returnedGoal.goal.props.targetAmount!.value).toBe(10000);
      expect(returnedGoal.goal.props.currentAmount.value).toBe(2000);
      expect(returnedGoal.goal.props.userId).toBe('user-123');
    });

    it('should handle multiple goals with different properties', async () => {
      // Arrange
      const mockGoals = [
        createMockGoalAggregate({
          title: 'Emergency Fund',
          targetAmount: new CurrencyVO(50000, Currency.VND),
          currentAmount: new CurrencyVO(15000, Currency.VND),
        }),
        createMockGoalAggregate({
          title: 'New Car',
          targetAmount: new CurrencyVO(300000, Currency.VND),
          currentAmount: new CurrencyVO(50000, Currency.VND),
        }),
        createMockGoalAggregate({
          title: 'Vacation Fund',
          targetAmount: undefined,
          currentAmount: new CurrencyVO(5000, Currency.VND),
        }),
      ];
      goalAggregateRepository.findMany.mockResolvedValue(mockGoals);

      // Act
      const result = await useCase.execute(validInput);

      // Assert
      expect(result).toHaveLength(3);
      expect(result[0].goal.props.title).toBe('Emergency Fund');
      expect(result[1].goal.props.title).toBe('New Car');
      expect(result[2].goal.props.title).toBe('Vacation Fund');
      expect(result[2].goal.props.targetAmount).toBeUndefined();
    });

    it('should handle different user IDs correctly', async () => {
      // Arrange
      const testCases = [
        'user-1',
        'user-2',
        'very-long-user-id-12345',
        'different-format-user',
      ];

      for (const userId of testCases) {
        const input: GetGoalsUseCaseInput = { userId };
        const mockGoal = createMockGoalAggregate({ userId });
        goalAggregateRepository.findMany.mockResolvedValue([mockGoal]);

        // Act
        const result = await useCase.execute(input);

        // Assert
        expect(goalAggregateRepository.findMany).toHaveBeenCalledWith({
          userId,
        });
        expect(result).toHaveLength(1);
        expect(result[0].goal.props.userId).toBe(userId);

        jest.clearAllMocks();
      }
    });

    it('should handle repository errors and rethrow them', async () => {
      // Arrange
      const repositoryError = new Error('Database connection failed');
      goalAggregateRepository.findMany.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(useCase.execute(validInput)).rejects.toThrow(repositoryError);
      expect(goalAggregateRepository.findMany).toHaveBeenCalledWith({
        userId: validInput.userId,
      });
      expect(goalAggregateRepository.findMany).toHaveBeenCalledTimes(1);
    });

    it('should handle repository returning null and convert to empty array', async () => {
      // Arrange
      goalAggregateRepository.findMany.mockResolvedValue(null as any);

      // Act
      const result = await useCase.execute(validInput);

      // Assert
      expect(goalAggregateRepository.findMany).toHaveBeenCalledWith({
        userId: validInput.userId,
      });
      expect(result).toEqual(null);
    });

    it('should handle large number of goals', async () => {
      // Arrange
      const mockGoals = Array.from({ length: 50 }, (_, index) =>
        createMockGoalAggregate({
          title: `Goal ${index + 1}`,
          targetAmount: new CurrencyVO((index + 1) * 1000, Currency.VND),
          currentAmount: new CurrencyVO((index + 1) * 100, Currency.VND),
        }),
      );
      goalAggregateRepository.findMany.mockResolvedValue(mockGoals);

      // Act
      const result = await useCase.execute(validInput);

      // Assert
      expect(result).toHaveLength(50);
      expect(result[0].goal.props.title).toBe('Goal 1');
      expect(result[49].goal.props.title).toBe('Goal 50');
      expect(result[0].goal.props.targetAmount!.value).toBe(1000);
      expect(result[49].goal.props.targetAmount!.value).toBe(50000);
    });

    it('should preserve goal ordering from repository', async () => {
      // Arrange
      const mockGoals = [
        createMockGoalAggregate({
          title: 'First Goal',
          createdAt: new Date('2025-01-01T00:00:00Z'),
        }),
        createMockGoalAggregate({
          title: 'Second Goal',
          createdAt: new Date('2025-01-02T00:00:00Z'),
        }),
        createMockGoalAggregate({
          title: 'Third Goal',
          createdAt: new Date('2025-01-03T00:00:00Z'),
        }),
      ];
      goalAggregateRepository.findMany.mockResolvedValue(mockGoals);

      // Act
      const result = await useCase.execute(validInput);

      // Assert
      expect(result).toHaveLength(3);
      expect(result[0].goal.props.title).toBe('First Goal');
      expect(result[1].goal.props.title).toBe('Second Goal');
      expect(result[2].goal.props.title).toBe('Third Goal');
    });

    it('should not modify repository method parameters', async () => {
      // Arrange
      const originalInput = { userId: 'test-user' };
      const inputCopy = { ...originalInput };
      goalAggregateRepository.findMany.mockResolvedValue([]);

      // Act
      await useCase.execute(originalInput);

      // Assert
      expect(originalInput).toEqual(inputCopy);
      expect(goalAggregateRepository.findMany).toHaveBeenCalledWith({
        userId: inputCopy.userId,
      });
    });

    it('should verify exact repository method calls', async () => {
      // Arrange
      goalAggregateRepository.findMany.mockResolvedValue([]);

      // Act
      await useCase.execute(validInput);

      // Assert
      expect(goalAggregateRepository.findMany).toHaveBeenCalledTimes(1);
      expect(goalAggregateRepository.findMany).toHaveBeenCalledWith({
        userId: validInput.userId,
      });
      expect(goalAggregateRepository.findOne).not.toHaveBeenCalled();
      expect(goalAggregateRepository.save).not.toHaveBeenCalled();
      expect(goalAggregateRepository.findById).not.toHaveBeenCalled();
    });

    it('should handle goals with different due dates', async () => {
      // Arrange
      const mockGoals = [
        createMockGoalAggregate({
          title: 'Short-term Goal',
          dueDate: new Date('2025-06-01'),
        }),
        createMockGoalAggregate({
          title: 'Long-term Goal',
          dueDate: new Date('2030-12-31'),
        }),
        createMockGoalAggregate({
          title: 'No Due Date Goal',
          dueDate: undefined,
        }),
      ];
      goalAggregateRepository.findMany.mockResolvedValue(mockGoals);

      // Act
      const result = await useCase.execute(validInput);

      // Assert
      expect(result).toHaveLength(3);
      expect(result[0].goal.props.dueDate).toEqual(new Date('2025-06-01'));
      expect(result[1].goal.props.dueDate).toEqual(new Date('2030-12-31'));
      expect(result[2].goal.props.dueDate).toBeUndefined();
    });

    it('should handle goals with different target amounts including zero and undefined', async () => {
      // Arrange
      const mockGoals = [
        createMockGoalAggregate({
          title: 'High Target Goal',
          targetAmount: new CurrencyVO(1000000, Currency.VND),
        }),
        createMockGoalAggregate({
          title: 'Low Target Goal',
          targetAmount: new CurrencyVO(100, Currency.VND),
        }),
        createMockGoalAggregate({
          title: 'No Target Goal',
          targetAmount: undefined,
        }),
      ];
      goalAggregateRepository.findMany.mockResolvedValue(mockGoals);

      // Act
      const result = await useCase.execute(validInput);

      // Assert
      expect(result).toHaveLength(3);
      expect(result[0].goal.props.targetAmount!.value).toBe(1000000);
      expect(result[1].goal.props.targetAmount!.value).toBe(100);
      expect(result[2].goal.props.targetAmount).toBeUndefined();
    });
  });
});