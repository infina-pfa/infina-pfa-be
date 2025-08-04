import { Test, TestingModule } from '@nestjs/testing';
import { GoalController } from '../goal.controller';
import {
  CreateGoalUseCase,
  GetGoalsUseCase,
  UpdateGoalUseCase,
} from '@/goals/use-cases';
import { GoalAggregate, GoalEntity } from '@/goals/domain';
import { GoalTransactionsWatchList } from '@/goals/domain/watch-list/goal-transactions.watch-list';
import { GoalResponseDto } from '../dto/goal.dto';
import { AuthUser } from '@/common/types';
import { CurrencyVO } from '@/common/base';
import { Currency } from '@/common/types';
import { TransactionEntity, TransactionType } from '@/budgeting/domain';

describe('GoalController - getGoals', () => {
  let controller: GoalController;
  let getGoalsUseCase: jest.Mocked<GetGoalsUseCase>;

  const mockDate = new Date('2025-01-01T00:00:00Z');
  const mockUpdateDate = new Date('2025-01-02T00:00:00Z');

  const mockAuthUser: AuthUser = {
    id: 'auth-user-123',
    email: 'test@example.com',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: '2024-01-01T00:00:00Z',
  } as AuthUser;

  const createMockGoalAggregate = (overrides: Partial<any> = {}): GoalAggregate => {
    const goalEntity = GoalEntity.create({
      userId: 'auth-user-123',
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

  beforeEach(async () => {
    const mockCreateGoalUseCase = { execute: jest.fn() };
    const mockGetGoalsUseCase = { execute: jest.fn() };
    const mockUpdateGoalUseCase = { execute: jest.fn() };

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
      ],
    }).compile();

    controller = module.get<GoalController>(GoalController);
    getGoalsUseCase = module.get(GetGoalsUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getGoals', () => {
    describe('Happy Path', () => {
      it('should return user goals as DTOs', async () => {
        // Arrange
        const mockGoalAggregates = [
          createMockGoalAggregate({
            title: 'Emergency Fund',
            description: 'Build emergency savings',
            targetAmount: new CurrencyVO(50000, Currency.VND),
            currentAmount: new CurrencyVO(15000, Currency.VND),
            dueDate: new Date('2025-12-31'),
          }),
          createMockGoalAggregate({
            title: 'Vacation Fund',
            description: 'Save for vacation',
            targetAmount: new CurrencyVO(20000, Currency.VND),
            currentAmount: new CurrencyVO(5000, Currency.VND),
            dueDate: new Date('2025-06-01'),
          }),
        ];

        getGoalsUseCase.execute.mockResolvedValue(mockGoalAggregates);

        // Act
        const result = await controller.getGoals(mockAuthUser);

        // Assert
        expect(getGoalsUseCase.execute).toHaveBeenCalledWith({
          userId: 'auth-user-123',
        });
        expect(result).toHaveLength(2);
        expect(result[0]).toBeInstanceOf(GoalResponseDto);
        expect(result[1]).toBeInstanceOf(GoalResponseDto);
        expect(result[0].title).toBe('Emergency Fund');
        expect(result[0].description).toBe('Build emergency savings');
        expect(result[0].targetAmount).toBe(50000);
        expect(result[0].currentAmount).toBe(15000);
        expect(result[0].dueDate).toBe('2025-12-31T00:00:00.000Z');
        expect(result[1].title).toBe('Vacation Fund');
        expect(result[1].targetAmount).toBe(20000);
        expect(result[1].currentAmount).toBe(5000);
      });

      it('should return empty array when user has no goals', async () => {
        // Arrange
        getGoalsUseCase.execute.mockResolvedValue([]);

        // Act
        const result = await controller.getGoals(mockAuthUser);

        // Assert
        expect(getGoalsUseCase.execute).toHaveBeenCalledWith({
          userId: 'auth-user-123',
        });
        expect(result).toEqual([]);
        expect(result).toHaveLength(0);
      });

      it('should handle goals with different properties correctly', async () => {
        // Arrange
        const mockGoalAggregates = [
          createMockGoalAggregate({
            title: 'Goal with all properties',
            description: 'Complete goal',
            targetAmount: new CurrencyVO(100000, Currency.VND),
            currentAmount: new CurrencyVO(25000, Currency.VND),
            dueDate: new Date('2025-12-31'),
          }),
          createMockGoalAggregate({
            title: 'Goal without description',
            description: undefined,
            targetAmount: new CurrencyVO(50000, Currency.VND),
            currentAmount: new CurrencyVO(10000, Currency.VND),
            dueDate: new Date('2025-06-01'),
          }),
          createMockGoalAggregate({
            title: 'Goal without target amount',
            description: 'No target set',
            targetAmount: undefined,
            currentAmount: new CurrencyVO(5000, Currency.VND),
            dueDate: new Date('2025-03-01'),
          }),
          createMockGoalAggregate({
            title: 'Goal without due date',
            description: 'No deadline',
            targetAmount: new CurrencyVO(30000, Currency.VND),
            currentAmount: new CurrencyVO(8000, Currency.VND),
            dueDate: undefined,
          }),
        ];

        getGoalsUseCase.execute.mockResolvedValue(mockGoalAggregates);

        // Act
        const result = await controller.getGoals(mockAuthUser);

        // Assert
        expect(result).toHaveLength(4);
        expect(result[0].description).toBe('Complete goal');
        expect(result[0].targetAmount).toBe(100000);
        expect(result[0].dueDate).toBe('2025-12-31T00:00:00.000Z');
        
        expect(result[1].description).toBeUndefined();
        expect(result[1].targetAmount).toBe(50000);
        
        expect(result[2].targetAmount).toBeUndefined();
        expect(result[2].description).toBe('No target set');
        
        expect(result[3].dueDate).toBeUndefined();
        expect(result[3].targetAmount).toBe(30000);
      });

      it('should handle different user IDs correctly', async () => {
        // Arrange
        const testUsers = [
          { id: 'user-1', email: 'user1@test.com' },
          { id: 'user-2', email: 'user2@test.com' },
          { id: 'different-user-id', email: 'different@test.com' },
        ];

        for (const userData of testUsers) {
          const testUser: AuthUser = {
            ...mockAuthUser,
            id: userData.id,
            email: userData.email,
          };

          const mockGoalAggregate = createMockGoalAggregate({
            userId: userData.id,
            title: `Goal for ${userData.id}`,
          });

          getGoalsUseCase.execute.mockResolvedValue([mockGoalAggregate]);

          // Act
          const result = await controller.getGoals(testUser);

          // Assert
          expect(getGoalsUseCase.execute).toHaveBeenCalledWith({
            userId: userData.id,
          });
          expect(result).toHaveLength(1);
          expect(result[0].title).toBe(`Goal for ${userData.id}`);

          jest.clearAllMocks();
        }
      });

      it('should preserve goal ordering from use case', async () => {
        // Arrange
        const mockGoalAggregates = [
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

        getGoalsUseCase.execute.mockResolvedValue(mockGoalAggregates);

        // Act
        const result = await controller.getGoals(mockAuthUser);

        // Assert
        expect(result).toHaveLength(3);
        expect(result[0].title).toBe('First Goal');
        expect(result[1].title).toBe('Second Goal');
        expect(result[2].title).toBe('Third Goal');
      });

      it('should handle large number of goals', async () => {
        // Arrange
        const mockGoalAggregates = Array.from({ length: 50 }, (_, index) =>
          createMockGoalAggregate({
            title: `Goal ${index + 1}`,
            targetAmount: new CurrencyVO((index + 1) * 1000, Currency.VND),
            currentAmount: new CurrencyVO((index + 1) * 100, Currency.VND),
          }),
        );

        getGoalsUseCase.execute.mockResolvedValue(mockGoalAggregates);

        // Act
        const result = await controller.getGoals(mockAuthUser);

        // Assert
        expect(result).toHaveLength(50);
        expect(result[0].title).toBe('Goal 1');
        expect(result[49].title).toBe('Goal 50');
        expect(result[0].targetAmount).toBe(1000);
        expect(result[49].targetAmount).toBe(50000);
      });
    });

    describe('Authentication Integration', () => {
      it('should extract user ID from AuthUser correctly', async () => {
        // Arrange
        const testUser: AuthUser = {
          id: 'test-auth-user-456',
          email: 'auth-test@example.com',
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: '2024-01-01T00:00:00Z',
        } as AuthUser;

        getGoalsUseCase.execute.mockResolvedValue([]);

        // Act
        await controller.getGoals(testUser);

        // Assert
        expect(getGoalsUseCase.execute).toHaveBeenCalledWith({
          userId: 'test-auth-user-456',
        });
      });

      it('should handle user with empty metadata', async () => {
        // Arrange
        const emptyMetadataUser: AuthUser = {
          id: 'empty-metadata-user',
          email: 'empty@test.com',
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: '2024-01-01T00:00:00Z',
        } as AuthUser;

        getGoalsUseCase.execute.mockResolvedValue([]);

        // Act
        const result = await controller.getGoals(emptyMetadataUser);

        // Assert
        expect(getGoalsUseCase.execute).toHaveBeenCalledWith({
          userId: 'empty-metadata-user',
        });
        expect(result).toEqual([]);
      });

      it('should handle user with different audience values', async () => {
        // Arrange
        const differentAudUser: AuthUser = {
          id: 'different-aud-user',
          email: 'different@test.com',
          app_metadata: {},
          user_metadata: {},
          aud: 'custom-audience',
          created_at: '2024-01-01T00:00:00Z',
        } as AuthUser;

        getGoalsUseCase.execute.mockResolvedValue([]);

        // Act
        await controller.getGoals(differentAudUser);

        // Assert
        expect(getGoalsUseCase.execute).toHaveBeenCalledWith({
          userId: 'different-aud-user',
        });
      });

      it('should isolate user data by user ID', async () => {
        // Arrange
        const user1: AuthUser = { ...mockAuthUser, id: 'user-1' };
        const user2: AuthUser = { ...mockAuthUser, id: 'user-2' };

        const user1Goal = createMockGoalAggregate({
          userId: 'user-1',
          title: 'User 1 Goal',
        });

        const user2Goal = createMockGoalAggregate({
          userId: 'user-2',
          title: 'User 2 Goal',
        });

        // Test user 1
        getGoalsUseCase.execute.mockResolvedValueOnce([user1Goal]);
        const result1 = await controller.getGoals(user1);

        expect(getGoalsUseCase.execute).toHaveBeenCalledWith({
          userId: 'user-1',
        });
        expect(result1).toHaveLength(1);
        expect(result1[0].title).toBe('User 1 Goal');

        // Test user 2
        getGoalsUseCase.execute.mockResolvedValueOnce([user2Goal]);
        const result2 = await controller.getGoals(user2);

        expect(getGoalsUseCase.execute).toHaveBeenCalledWith({
          userId: 'user-2',
        });
        expect(result2).toHaveLength(1);
        expect(result2[0].title).toBe('User 2 Goal');
      });
    });

    describe('DTO Conversion', () => {
      it('should convert GoalAggregate to GoalResponseDto correctly', async () => {
        // Arrange
        const mockGoalAggregate = createMockGoalAggregate({
          title: 'Test Goal',
          description: 'Test Description',
          targetAmount: new CurrencyVO(75000, Currency.VND),
          currentAmount: new CurrencyVO(25000, Currency.VND),
          dueDate: new Date('2025-12-31T23:59:59Z'),
        });

        getGoalsUseCase.execute.mockResolvedValue([mockGoalAggregate]);

        // Act
        const result = await controller.getGoals(mockAuthUser);

        // Assert
        expect(result).toHaveLength(1);
        const dto = result[0];
        expect(dto.id).toBe(mockGoalAggregate.goal.id);
        expect(dto.title).toBe('Test Goal');
        expect(dto.description).toBe('Test Description');
        expect(dto.targetAmount).toBe(75000);
        expect(dto.currentAmount).toBe(25000);
        expect(dto.dueDate).toBe('2025-12-31T23:59:59.000Z');
        expect(dto.createdAt).toEqual(mockDate);
        expect(dto.updatedAt).toEqual(mockUpdateDate);
        expect(dto.contributions).toEqual([]);
      });

      it('should use GoalResponseDto.fromEntity method', async () => {
        // Arrange
        const mockGoalAggregate = createMockGoalAggregate();
        getGoalsUseCase.execute.mockResolvedValue([mockGoalAggregate]);

        const fromEntitySpy = jest.spyOn(GoalResponseDto, 'fromEntity');

        // Act
        await controller.getGoals(mockAuthUser);

        // Assert
        expect(fromEntitySpy).toHaveBeenCalledTimes(1);
        expect(fromEntitySpy).toHaveBeenCalledWith(mockGoalAggregate);
      });

      it('should handle DTO conversion for different target amounts', async () => {
        // Arrange
        const testAmounts = [1000, 50000, 1000000, undefined];

        for (const amount of testAmounts) {
          const mockGoalAggregate = createMockGoalAggregate({
            title: `Goal ${amount || 'No Target'}`,
            targetAmount: amount ? new CurrencyVO(amount, Currency.VND) : undefined,
          });

          getGoalsUseCase.execute.mockResolvedValue([mockGoalAggregate]);

          // Act
          const result = await controller.getGoals(mockAuthUser);

          // Assert
          expect(result).toHaveLength(1);
          expect(result[0].targetAmount).toBe(amount);
          expect(result[0].title).toBe(`Goal ${amount || 'No Target'}`);

          jest.clearAllMocks();
        }
      });

      it('should handle DTO conversion for different current amounts', async () => {
        // Arrange
        const testAmounts = [0, 100, 25000, 999999];

        for (const amount of testAmounts) {
          const mockGoalAggregate = createMockGoalAggregate({
            title: `Goal ${amount}`,
            currentAmount: new CurrencyVO(amount, Currency.VND),
          });

          getGoalsUseCase.execute.mockResolvedValue([mockGoalAggregate]);

          // Act
          const result = await controller.getGoals(mockAuthUser);

          // Assert
          expect(result).toHaveLength(1);
          expect(result[0].currentAmount).toBe(amount);
          expect(result[0].title).toBe(`Goal ${amount}`);

          jest.clearAllMocks();
        }
      });

      it('should preserve date objects in DTO conversion', async () => {
        // Arrange
        const specificCreateDate = new Date('2025-03-10T15:30:45Z');
        const specificUpdateDate = new Date('2025-03-11T16:45:30Z');
        const specificDueDate = new Date('2025-12-25T00:00:00Z');

        const mockGoalAggregate = createMockGoalAggregate({
          title: 'Date Test Goal',
          dueDate: specificDueDate,
          createdAt: specificCreateDate,
          updatedAt: specificUpdateDate,
        });

        getGoalsUseCase.execute.mockResolvedValue([mockGoalAggregate]);

        // Act
        const result = await controller.getGoals(mockAuthUser);

        // Assert
        expect(result).toHaveLength(1);
        expect(result[0].createdAt).toEqual(specificCreateDate);
        expect(result[0].updatedAt).toEqual(specificUpdateDate);
        expect(result[0].dueDate).toBe(specificDueDate.toISOString());
      });

      it('should handle goals with contributions in DTO conversion', async () => {
        // Arrange
        const contribution = TransactionEntity.create({
          userId: 'auth-user-123',
          amount: new CurrencyVO(1000, Currency.VND),
          type: TransactionType.INCOME,
          name: 'Goal Contribution',
          description: 'Monthly savings',
          recurring: 0,
          createdAt: mockDate,
          updatedAt: mockUpdateDate,
        });

        const contributions = new GoalTransactionsWatchList([contribution]);
        const goalEntity = GoalEntity.create({
          userId: 'auth-user-123',
          title: 'Goal with Contributions',
          description: 'Goal with contributions description',
          targetAmount: new CurrencyVO(5000, Currency.VND),
          currentAmount: new CurrencyVO(1000, Currency.VND),
          dueDate: new Date('2025-12-31'),
          createdAt: mockDate,
          updatedAt: mockUpdateDate,
        });

        const mockGoalAggregate = GoalAggregate.create({
          goal: goalEntity,
          contributions,
        });

        getGoalsUseCase.execute.mockResolvedValue([mockGoalAggregate]);

        // Act
        const result = await controller.getGoals(mockAuthUser);

        // Assert
        expect(result).toHaveLength(1);
        expect(result[0].contributions).toHaveLength(1);
        expect(result[0].contributions[0].name).toBe('Goal Contribution');
        expect(result[0].contributions[0].amount).toBe(1000);
      });
    });

    describe('Error Handling', () => {
      it('should handle use case errors and rethrow them', async () => {
        // Arrange
        const useCaseError = new Error('Use case failed');
        getGoalsUseCase.execute.mockRejectedValue(useCaseError);

        // Act & Assert
        await expect(controller.getGoals(mockAuthUser)).rejects.toThrow(useCaseError);
        expect(getGoalsUseCase.execute).toHaveBeenCalledWith({
          userId: 'auth-user-123',
        });
      });

      it('should handle repository errors passed through use case', async () => {
        // Arrange
        const repositoryError = new Error('Database connection failed');
        getGoalsUseCase.execute.mockRejectedValue(repositoryError);

        // Act & Assert
        await expect(controller.getGoals(mockAuthUser)).rejects.toThrow(repositoryError);
      });
    });

    describe('Method Call Verification', () => {
      it('should call use case exactly once with correct parameters', async () => {
        // Arrange
        getGoalsUseCase.execute.mockResolvedValue([]);

        // Act
        await controller.getGoals(mockAuthUser);

        // Assert
        expect(getGoalsUseCase.execute).toHaveBeenCalledTimes(1);
        expect(getGoalsUseCase.execute).toHaveBeenCalledWith({
          userId: 'auth-user-123',
        });
      });

      it('should not modify AuthUser object', async () => {
        // Arrange
        const originalUser = { ...mockAuthUser };
        getGoalsUseCase.execute.mockResolvedValue([]);

        // Act
        await controller.getGoals(mockAuthUser);

        // Assert
        expect(mockAuthUser).toEqual(originalUser);
      });

      it('should call GoalResponseDto.fromEntity for each goal', async () => {
        // Arrange
        const mockGoalAggregates = [
          createMockGoalAggregate({ title: 'Goal 1' }),
          createMockGoalAggregate({ title: 'Goal 2' }),
          createMockGoalAggregate({ title: 'Goal 3' }),
        ];

        getGoalsUseCase.execute.mockResolvedValue(mockGoalAggregates);
        const fromEntitySpy = jest.spyOn(GoalResponseDto, 'fromEntity');

        // Act
        await controller.getGoals(mockAuthUser);

        // Assert
        expect(fromEntitySpy).toHaveBeenCalledTimes(3);
        mockGoalAggregates.forEach((aggregate, index) => {
          expect(fromEntitySpy).toHaveBeenNthCalledWith(index + 1, aggregate);
        });
      });
    });
  });
});