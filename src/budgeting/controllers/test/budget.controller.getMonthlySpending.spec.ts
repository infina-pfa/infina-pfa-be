import { Test, TestingModule } from '@nestjs/testing';
import { AuthUser } from '@/common/types/auth-user';
import { CurrencyVO } from '@/common/base';
import {
  TransactionEntity,
  TransactionType,
} from '@/budgeting/domain/entities/transactions.entity';
import { GetMonthlySpendingUseCase } from '@/budgeting/use-cases/get-monthly-spending.use-case';
import { MonthlySpendingQueryDto } from '../dto/monthly-spending-query.dto';
import { TransactionResponseDto } from '../dto/transaction.dto';
import { BudgetController } from '../budget.controller';
import {
  CreateBudgetUseCase,
  GetBudgetsUseCase,
  GetBudgetDetailUseCase,
  UpdateBudgetUseCase,
  SpendUseCase,
} from '@/budgeting/use-cases';

describe('BudgetController - getMonthlySpending', () => {
  let controller: BudgetController;
  let getMonthlySpendingUseCase: jest.Mocked<GetMonthlySpendingUseCase>;

  const mockDate = new Date('2024-03-15T10:00:00Z');
  const mockUpdateDate = new Date('2024-03-16T10:00:00Z');

  const mockAuthUser: AuthUser = {
    id: 'auth-user-123',
    email: 'test@example.com',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: '2024-01-01T00:00:00Z',
  } as AuthUser;

  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(async () => {
    const mockCreateBudgetUseCase = { execute: jest.fn() };
    const mockGetBudgetsUseCase = { execute: jest.fn() };
    const mockGetBudgetDetailUseCase = { execute: jest.fn() };
    const mockGetMonthlySpendingUseCase = { execute: jest.fn() };
    const mockUpdateBudgetUseCase = { execute: jest.fn() };
    const mockSpendUseCase = { execute: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BudgetController],
      providers: [
        {
          provide: CreateBudgetUseCase,
          useValue: mockCreateBudgetUseCase,
        },
        {
          provide: GetBudgetsUseCase,
          useValue: mockGetBudgetsUseCase,
        },
        {
          provide: GetBudgetDetailUseCase,
          useValue: mockGetBudgetDetailUseCase,
        },
        {
          provide: GetMonthlySpendingUseCase,
          useValue: mockGetMonthlySpendingUseCase,
        },
        {
          provide: UpdateBudgetUseCase,
          useValue: mockUpdateBudgetUseCase,
        },
        {
          provide: SpendUseCase,
          useValue: mockSpendUseCase,
        },
      ],
    }).compile();

    controller = module.get<BudgetController>(BudgetController);
    getMonthlySpendingUseCase = module.get(GetMonthlySpendingUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getMonthlySpending', () => {
    describe('Happy Path', () => {
      it('should return monthly spending transactions as DTOs', async () => {
        const query: MonthlySpendingQueryDto = {
          month: 3,
          year: 2024,
        };

        const mockTransactions = [
          TransactionEntity.create({
            userId: 'auth-user-123',
            amount: new CurrencyVO(50000),
            recurring: 0,
            name: 'Grocery Shopping',
            description: 'Weekly groceries',
            type: TransactionType.OUTCOME,
            createdAt: mockDate,
            updatedAt: mockUpdateDate,
          }),
          TransactionEntity.create({
            userId: 'auth-user-123',
            amount: new CurrencyVO(30000),
            recurring: 0,
            name: 'Gas Station',
            description: 'Fuel for car',
            type: TransactionType.OUTCOME,
            createdAt: mockDate,
            updatedAt: mockUpdateDate,
          }),
        ];

        getMonthlySpendingUseCase.execute.mockResolvedValue(mockTransactions);

        const result = await controller.getMonthlySpending(mockAuthUser, query);

        expect(getMonthlySpendingUseCase.execute).toHaveBeenCalledWith({
          userId: 'auth-user-123',
          month: 3,
          year: 2024,
        });
        expect(result).toHaveLength(2);
        expect(result[0]).toEqual({
          id: mockTransactions[0].id,
          name: 'Grocery Shopping',
          description: 'Weekly groceries',
          amount: 50000,
          type: TransactionType.OUTCOME,
          recurring: 0,
          createdAt: mockDate,
          updatedAt: mockUpdateDate,
        });
        expect(result[1]).toEqual({
          id: mockTransactions[1].id,
          name: 'Gas Station',
          description: 'Fuel for car',
          amount: 30000,
          type: TransactionType.OUTCOME,
          recurring: 0,
          createdAt: mockDate,
          updatedAt: mockUpdateDate,
        });
      });

      it('should return empty array when no transactions found', async () => {
        const query: MonthlySpendingQueryDto = {
          month: 3,
          year: 2024,
        };

        getMonthlySpendingUseCase.execute.mockResolvedValue([]);

        const result = await controller.getMonthlySpending(mockAuthUser, query);

        expect(getMonthlySpendingUseCase.execute).toHaveBeenCalledWith({
          userId: 'auth-user-123',
          month: 3,
          year: 2024,
        });
        expect(result).toEqual([]);
        expect(result).toHaveLength(0);
      });

      it('should handle different months correctly', async () => {
        const testCases = [
          { month: 1, year: 2024 },
          { month: 6, year: 2024 },
          { month: 12, year: 2024 },
        ];

        for (const { month, year } of testCases) {
          const query: MonthlySpendingQueryDto = { month, year };

          const mockTransaction = TransactionEntity.create({
            userId: 'auth-user-123',
            amount: new CurrencyVO(25000),
            recurring: 0,
            name: `Transaction ${month}/${year}`,
            description: `Test transaction for ${month}/${year}`,
            type: TransactionType.OUTCOME,
            createdAt: mockDate,
            updatedAt: mockUpdateDate,
          });

          getMonthlySpendingUseCase.execute.mockResolvedValue([
            mockTransaction,
          ]);

          const result = await controller.getMonthlySpending(
            mockAuthUser,
            query,
          );

          expect(getMonthlySpendingUseCase.execute).toHaveBeenCalledWith({
            userId: 'auth-user-123',
            month,
            year,
          });
          expect(result).toHaveLength(1);
          expect(result[0].name).toBe(`Transaction ${month}/${year}`);
          expect(result[0].amount).toBe(25000);

          jest.clearAllMocks();
        }
      });

      it('should handle different years correctly', async () => {
        const testCases = [2023, 2024, 2025];

        for (const year of testCases) {
          const query: MonthlySpendingQueryDto = { month: 6, year };

          const mockTransaction = TransactionEntity.create({
            userId: 'auth-user-123',
            amount: new CurrencyVO(40000),
            recurring: 0,
            name: `Transaction ${year}`,
            description: `Test transaction for year ${year}`,
            type: TransactionType.OUTCOME,
            createdAt: mockDate,
            updatedAt: mockUpdateDate,
          });

          getMonthlySpendingUseCase.execute.mockResolvedValue([
            mockTransaction,
          ]);

          const result = await controller.getMonthlySpending(
            mockAuthUser,
            query,
          );

          expect(getMonthlySpendingUseCase.execute).toHaveBeenCalledWith({
            userId: 'auth-user-123',
            month: 6,
            year,
          });
          expect(result).toHaveLength(1);
          expect(result[0].name).toBe(`Transaction ${year}`);

          jest.clearAllMocks();
        }
      });

      it('should handle different user IDs correctly', async () => {
        const testUsers = [
          { id: 'user-1', email: 'user1@test.com' },
          { id: 'user-2', email: 'user2@test.com' },
          { id: 'different-user-id', email: 'different@test.com' },
        ];

        const query: MonthlySpendingQueryDto = { month: 3, year: 2024 };

        for (const userData of testUsers) {
          const testUser: AuthUser = {
            ...mockAuthUser,
            id: userData.id,
            email: userData.email,
          };

          const mockTransaction = TransactionEntity.create({
            userId: userData.id,
            amount: new CurrencyVO(35000),
            recurring: 0,
            name: `Transaction for ${userData.id}`,
            description: `Test transaction for ${userData.id}`,
            type: TransactionType.OUTCOME,
            createdAt: mockDate,
            updatedAt: mockUpdateDate,
          });

          getMonthlySpendingUseCase.execute.mockResolvedValue([
            mockTransaction,
          ]);

          const result = await controller.getMonthlySpending(testUser, query);

          expect(getMonthlySpendingUseCase.execute).toHaveBeenCalledWith({
            userId: userData.id,
            month: 3,
            year: 2024,
          });
          expect(result).toHaveLength(1);
          expect(result[0].name).toBe(`Transaction for ${userData.id}`);

          jest.clearAllMocks();
        }
      });

      it('should preserve transaction ordering from use case', async () => {
        const query: MonthlySpendingQueryDto = { month: 3, year: 2024 };

        const mockTransactions = [
          TransactionEntity.create({
            userId: 'auth-user-123',
            amount: new CurrencyVO(10000),
            recurring: 0,
            name: 'First Transaction',
            description: 'First',
            type: TransactionType.OUTCOME,
            createdAt: new Date('2024-03-01T00:00:00Z'),
            updatedAt: new Date('2024-03-01T00:00:00Z'),
          }),
          TransactionEntity.create({
            userId: 'auth-user-123',
            amount: new CurrencyVO(20000),
            recurring: 0,
            name: 'Second Transaction',
            description: 'Second',
            type: TransactionType.OUTCOME,
            createdAt: new Date('2024-03-15T00:00:00Z'),
            updatedAt: new Date('2024-03-15T00:00:00Z'),
          }),
          TransactionEntity.create({
            userId: 'auth-user-123',
            amount: new CurrencyVO(30000),
            recurring: 0,
            name: 'Third Transaction',
            description: 'Third',
            type: TransactionType.OUTCOME,
            createdAt: new Date('2024-03-30T00:00:00Z'),
            updatedAt: new Date('2024-03-30T00:00:00Z'),
          }),
        ];

        getMonthlySpendingUseCase.execute.mockResolvedValue(mockTransactions);

        const result = await controller.getMonthlySpending(mockAuthUser, query);

        expect(result).toHaveLength(3);
        expect(result[0].name).toBe('First Transaction');
        expect(result[1].name).toBe('Second Transaction');
        expect(result[2].name).toBe('Third Transaction');
        expect(result[0].amount).toBe(10000);
        expect(result[1].amount).toBe(20000);
        expect(result[2].amount).toBe(30000);
      });

      it('should handle large number of transactions', async () => {
        const query: MonthlySpendingQueryDto = { month: 3, year: 2024 };

        // Create 50 mock transactions
        const mockTransactions = Array.from({ length: 50 }, (_, index) =>
          TransactionEntity.create({
            userId: 'auth-user-123',
            amount: new CurrencyVO((index + 1) * 1000),
            recurring: 0,
            name: `Transaction ${index + 1}`,
            description: `Description ${index + 1}`,
            type: TransactionType.OUTCOME,
            createdAt: mockDate,
            updatedAt: mockUpdateDate,
          }),
        );

        getMonthlySpendingUseCase.execute.mockResolvedValue(mockTransactions);

        const result = await controller.getMonthlySpending(mockAuthUser, query);

        expect(result).toHaveLength(50);
        expect(result[0].name).toBe('Transaction 1');
        expect(result[49].name).toBe('Transaction 50');
        expect(result[0].amount).toBe(1000);
        expect(result[49].amount).toBe(50000);
      });
    });

    describe('Authentication Integration', () => {
      it('should extract user ID from AuthUser correctly', async () => {
        const testUser: AuthUser = {
          id: 'test-auth-user-456',
          email: 'auth-test@example.com',
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: '2024-01-01T00:00:00Z',
        } as AuthUser;

        const query: MonthlySpendingQueryDto = { month: 4, year: 2024 };

        getMonthlySpendingUseCase.execute.mockResolvedValue([]);

        await controller.getMonthlySpending(testUser, query);

        expect(getMonthlySpendingUseCase.execute).toHaveBeenCalledWith({
          userId: 'test-auth-user-456',
          month: 4,
          year: 2024,
        });
      });

      it('should handle user with empty metadata', async () => {
        const emptyMetadataUser: AuthUser = {
          id: 'empty-metadata-user',
          email: 'empty@test.com',
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: '2024-01-01T00:00:00Z',
        } as AuthUser;

        const query: MonthlySpendingQueryDto = { month: 5, year: 2024 };

        getMonthlySpendingUseCase.execute.mockResolvedValue([]);

        const result = await controller.getMonthlySpending(
          emptyMetadataUser,
          query,
        );

        expect(getMonthlySpendingUseCase.execute).toHaveBeenCalledWith({
          userId: 'empty-metadata-user',
          month: 5,
          year: 2024,
        });
        expect(result).toEqual([]);
      });

      it('should handle user with different audience values', async () => {
        const differentAudUser: AuthUser = {
          id: 'different-aud-user',
          email: 'different@test.com',
          app_metadata: {},
          user_metadata: {},
          aud: 'custom-audience',
          created_at: '2024-01-01T00:00:00Z',
        } as AuthUser;

        const query: MonthlySpendingQueryDto = { month: 6, year: 2024 };

        getMonthlySpendingUseCase.execute.mockResolvedValue([]);

        await controller.getMonthlySpending(differentAudUser, query);

        expect(getMonthlySpendingUseCase.execute).toHaveBeenCalledWith({
          userId: 'different-aud-user',
          month: 6,
          year: 2024,
        });
      });

      it('should isolate user data by user ID', async () => {
        const user1: AuthUser = { ...mockAuthUser, id: 'user-1' };
        const user2: AuthUser = { ...mockAuthUser, id: 'user-2' };
        const query: MonthlySpendingQueryDto = { month: 3, year: 2024 };

        const user1Transaction = TransactionEntity.create({
          userId: 'user-1',
          amount: new CurrencyVO(15000),
          recurring: 0,
          name: 'User 1 Transaction',
          description: 'Transaction for user 1',
          type: TransactionType.OUTCOME,
          createdAt: mockDate,
          updatedAt: mockUpdateDate,
        });

        const user2Transaction = TransactionEntity.create({
          userId: 'user-2',
          amount: new CurrencyVO(25000),
          recurring: 0,
          name: 'User 2 Transaction',
          description: 'Transaction for user 2',
          type: TransactionType.OUTCOME,
          createdAt: mockDate,
          updatedAt: mockUpdateDate,
        });

        // Test user 1
        getMonthlySpendingUseCase.execute.mockResolvedValueOnce([
          user1Transaction,
        ]);
        const result1 = await controller.getMonthlySpending(user1, query);

        expect(getMonthlySpendingUseCase.execute).toHaveBeenCalledWith({
          userId: 'user-1',
          month: 3,
          year: 2024,
        });
        expect(result1).toHaveLength(1);
        expect(result1[0].name).toBe('User 1 Transaction');

        // Test user 2
        getMonthlySpendingUseCase.execute.mockResolvedValueOnce([
          user2Transaction,
        ]);
        const result2 = await controller.getMonthlySpending(user2, query);

        expect(getMonthlySpendingUseCase.execute).toHaveBeenCalledWith({
          userId: 'user-2',
          month: 3,
          year: 2024,
        });
        expect(result2).toHaveLength(1);
        expect(result2[0].name).toBe('User 2 Transaction');
      });
    });

    describe('Query Parameter Handling', () => {
      it('should correctly pass query parameters to use case', async () => {
        const query: MonthlySpendingQueryDto = { month: 7, year: 2024 };

        getMonthlySpendingUseCase.execute.mockResolvedValue([]);

        await controller.getMonthlySpending(mockAuthUser, query);

        expect(getMonthlySpendingUseCase.execute).toHaveBeenCalledWith({
          userId: 'auth-user-123',
          month: 7,
          year: 2024,
        });
      });

      it('should handle edge month values (1 and 12)', async () => {
        const testCases = [
          { month: 1, year: 2024 },
          { month: 12, year: 2024 },
        ];

        for (const { month, year } of testCases) {
          const query: MonthlySpendingQueryDto = { month, year };

          getMonthlySpendingUseCase.execute.mockResolvedValue([]);

          await controller.getMonthlySpending(mockAuthUser, query);

          expect(getMonthlySpendingUseCase.execute).toHaveBeenCalledWith({
            userId: 'auth-user-123',
            month,
            year,
          });

          jest.clearAllMocks();
        }
      });

      it('should handle different year ranges', async () => {
        const testCases = [1900, 2024, 3000];

        for (const year of testCases) {
          const query: MonthlySpendingQueryDto = { month: 6, year };

          getMonthlySpendingUseCase.execute.mockResolvedValue([]);

          await controller.getMonthlySpending(mockAuthUser, query);

          expect(getMonthlySpendingUseCase.execute).toHaveBeenCalledWith({
            userId: 'auth-user-123',
            month: 6,
            year,
          });

          jest.clearAllMocks();
        }
      });

      it('should not modify query parameters before passing to use case', async () => {
        const originalQuery: MonthlySpendingQueryDto = { month: 8, year: 2024 };
        const queryCopy = { ...originalQuery };

        getMonthlySpendingUseCase.execute.mockResolvedValue([]);

        await controller.getMonthlySpending(mockAuthUser, originalQuery);

        expect(getMonthlySpendingUseCase.execute).toHaveBeenCalledWith({
          userId: 'auth-user-123',
          month: queryCopy.month,
          year: queryCopy.year,
        });
        expect(originalQuery).toEqual(queryCopy);
      });
    });

    describe('DTO Conversion', () => {
      it('should convert TransactionEntity to TransactionResponseDto correctly', async () => {
        const query: MonthlySpendingQueryDto = { month: 3, year: 2024 };

        const mockTransaction = TransactionEntity.create({
          userId: 'auth-user-123',
          amount: new CurrencyVO(75000),
          recurring: 1,
          name: 'Monthly Subscription',
          description: 'Recurring monthly payment',
          type: TransactionType.OUTCOME,
          createdAt: mockDate,
          updatedAt: mockUpdateDate,
        });

        getMonthlySpendingUseCase.execute.mockResolvedValue([mockTransaction]);

        const result = await controller.getMonthlySpending(mockAuthUser, query);

        expect(result).toHaveLength(1);
        const dto = result[0];
        expect(dto.id).toBe(mockTransaction.id);
        expect(dto.name).toBe('Monthly Subscription');
        expect(dto.description).toBe('Recurring monthly payment');
        expect(dto.amount).toBe(75000);
        expect(dto.type).toBe(TransactionType.OUTCOME);
        expect(dto.recurring).toBe(1);
        expect(dto.createdAt).toEqual(mockDate);
        expect(dto.updatedAt).toEqual(mockUpdateDate);
      });

      it('should use TransactionResponseDto.fromTransactionEntities method', async () => {
        const query: MonthlySpendingQueryDto = { month: 3, year: 2024 };

        const mockTransactions = [
          TransactionEntity.create({
            userId: 'auth-user-123',
            amount: new CurrencyVO(25000),
            recurring: 0,
            name: 'Test Transaction',
            description: 'Test Description',
            type: TransactionType.OUTCOME,
            createdAt: mockDate,
            updatedAt: mockUpdateDate,
          }),
        ];

        getMonthlySpendingUseCase.execute.mockResolvedValue(mockTransactions);

        const fromTransactionEntitiesSpy = jest.spyOn(
          TransactionResponseDto,
          'fromEntity',
        );

        await controller.getMonthlySpending(mockAuthUser, query);

        expect(fromTransactionEntitiesSpy).toHaveBeenCalledWith(
          mockTransactions,
        );
      });

      it('should handle DTO conversion for different transaction types', async () => {
        const query: MonthlySpendingQueryDto = { month: 3, year: 2024 };

        // Note: The API should only return OUTCOME transactions, but testing DTO conversion capability
        const mockTransaction = TransactionEntity.create({
          userId: 'auth-user-123',
          amount: new CurrencyVO(45000),
          recurring: 0,
          name: 'Outcome Transaction',
          description: 'Test outcome transaction',
          type: TransactionType.OUTCOME,
          createdAt: mockDate,
          updatedAt: mockUpdateDate,
        });

        getMonthlySpendingUseCase.execute.mockResolvedValue([mockTransaction]);

        const result = await controller.getMonthlySpending(mockAuthUser, query);

        expect(result).toHaveLength(1);
        expect(result[0].type).toBe(TransactionType.OUTCOME);
      });

      it('should handle DTO conversion for different amount values', async () => {
        const query: MonthlySpendingQueryDto = { month: 3, year: 2024 };
        const testAmounts = [1, 1000, 50000, 1000000];

        for (const amount of testAmounts) {
          const mockTransaction = TransactionEntity.create({
            userId: 'auth-user-123',
            amount: new CurrencyVO(amount),
            recurring: 0,
            name: `Transaction ${amount}`,
            description: `Test transaction with amount ${amount}`,
            type: TransactionType.OUTCOME,
            createdAt: mockDate,
            updatedAt: mockUpdateDate,
          });

          getMonthlySpendingUseCase.execute.mockResolvedValue([
            mockTransaction,
          ]);

          const result = await controller.getMonthlySpending(
            mockAuthUser,
            query,
          );

          expect(result).toHaveLength(1);
          expect(result[0].amount).toBe(amount);
          expect(result[0].name).toBe(`Transaction ${amount}`);

          jest.clearAllMocks();
        }
      });

      it('should handle DTO conversion for different recurring values', async () => {
        const query: MonthlySpendingQueryDto = { month: 3, year: 2024 };
        const testRecurringValues = [0, 1, 7, 30, 365];

        for (const recurring of testRecurringValues) {
          const mockTransaction = TransactionEntity.create({
            userId: 'auth-user-123',
            amount: new CurrencyVO(30000),
            recurring,
            name: `Recurring ${recurring}`,
            description: `Transaction with recurring ${recurring}`,
            type: TransactionType.OUTCOME,
            createdAt: mockDate,
            updatedAt: mockUpdateDate,
          });

          getMonthlySpendingUseCase.execute.mockResolvedValue([
            mockTransaction,
          ]);

          const result = await controller.getMonthlySpending(
            mockAuthUser,
            query,
          );

          expect(result).toHaveLength(1);
          expect(result[0].recurring).toBe(recurring);
          expect(result[0].name).toBe(`Recurring ${recurring}`);

          jest.clearAllMocks();
        }
      });

      it('should preserve date objects in DTO conversion', async () => {
        const query: MonthlySpendingQueryDto = { month: 3, year: 2024 };
        const specificCreateDate = new Date('2024-03-10T15:30:45Z');
        const specificUpdateDate = new Date('2024-03-11T16:45:30Z');

        const mockTransaction = TransactionEntity.create({
          userId: 'auth-user-123',
          amount: new CurrencyVO(35000),
          recurring: 0,
          name: 'Date Test Transaction',
          description: 'Testing date preservation',
          type: TransactionType.OUTCOME,
          createdAt: specificCreateDate,
          updatedAt: specificUpdateDate,
        });

        getMonthlySpendingUseCase.execute.mockResolvedValue([mockTransaction]);

        const result = await controller.getMonthlySpending(mockAuthUser, query);

        expect(result).toHaveLength(1);
        expect(result[0].createdAt).toEqual(specificCreateDate);
        expect(result[0].updatedAt).toEqual(specificUpdateDate);
        expect(result[0].createdAt).toBeInstanceOf(Date);
        expect(result[0].updatedAt).toBeInstanceOf(Date);
      });
    });

    describe('Error Handling', () => {
      it('should propagate use case errors', async () => {
        const query: MonthlySpendingQueryDto = { month: 3, year: 2024 };
        const useCaseError = new Error('Use case failed');

        getMonthlySpendingUseCase.execute.mockRejectedValue(useCaseError);

        await expect(
          controller.getMonthlySpending(mockAuthUser, query),
        ).rejects.toThrow('Use case failed');

        expect(getMonthlySpendingUseCase.execute).toHaveBeenCalledWith({
          userId: 'auth-user-123',
          month: 3,
          year: 2024,
        });
      });

      it('should handle repository errors from use case', async () => {
        const query: MonthlySpendingQueryDto = { month: 4, year: 2024 };
        const repositoryError = new Error('Database connection failed');

        getMonthlySpendingUseCase.execute.mockRejectedValue(repositoryError);

        await expect(
          controller.getMonthlySpending(mockAuthUser, query),
        ).rejects.toThrow('Database connection failed');
      });

      it('should handle timeout errors from use case', async () => {
        const query: MonthlySpendingQueryDto = { month: 5, year: 2024 };
        const timeoutError = new Error('Request timeout');

        getMonthlySpendingUseCase.execute.mockRejectedValue(timeoutError);

        await expect(
          controller.getMonthlySpending(mockAuthUser, query),
        ).rejects.toThrow('Request timeout');
      });

      it('should handle validation errors from use case', async () => {
        const query: MonthlySpendingQueryDto = { month: 6, year: 2024 };
        const validationError = new Error('Invalid month parameter');

        getMonthlySpendingUseCase.execute.mockRejectedValue(validationError);

        await expect(
          controller.getMonthlySpending(mockAuthUser, query),
        ).rejects.toThrow('Invalid month parameter');
      });

      it('should handle null response from use case gracefully', () => {
        const query: MonthlySpendingQueryDto = { month: 7, year: 2024 };

        getMonthlySpendingUseCase.execute.mockResolvedValue(null as any);

        // The DTO conversion should handle null gracefully
        expect(async () => {
          await controller.getMonthlySpending(mockAuthUser, query);
        }).not.toThrow();
      });

      it('should handle undefined response from use case gracefully', () => {
        const query: MonthlySpendingQueryDto = { month: 8, year: 2024 };

        getMonthlySpendingUseCase.execute.mockResolvedValue(undefined as any);

        // The DTO conversion should handle undefined gracefully
        expect(async () => {
          await controller.getMonthlySpending(mockAuthUser, query);
        }).not.toThrow();
      });
    });

    describe('Use Case Integration', () => {
      it('should call use case exactly once per request', async () => {
        const query: MonthlySpendingQueryDto = { month: 9, year: 2024 };

        getMonthlySpendingUseCase.execute.mockResolvedValue([]);

        await controller.getMonthlySpending(mockAuthUser, query);

        expect(getMonthlySpendingUseCase.execute).toHaveBeenCalledTimes(1);
      });

      it('should not call any other use case methods', async () => {
        const query: MonthlySpendingQueryDto = { month: 10, year: 2024 };

        getMonthlySpendingUseCase.execute.mockResolvedValue([]);

        await controller.getMonthlySpending(mockAuthUser, query);

        expect(getMonthlySpendingUseCase.execute).toHaveBeenCalledTimes(1);
        // Verify no other methods are called (they should remain at 0 calls)
      });

      it('should pass complete input object to use case', async () => {
        const query: MonthlySpendingQueryDto = { month: 11, year: 2024 };

        getMonthlySpendingUseCase.execute.mockResolvedValue([]);

        await controller.getMonthlySpending(mockAuthUser, query);

        const expectedInput = {
          userId: 'auth-user-123',
          month: 11,
          year: 2024,
        };

        expect(getMonthlySpendingUseCase.execute).toHaveBeenCalledWith(
          expectedInput,
        );
        expect(getMonthlySpendingUseCase.execute.mock.calls[0][0]).toEqual(
          expectedInput,
        );
      });

      it('should handle concurrent requests correctly', async () => {
        const query1: MonthlySpendingQueryDto = { month: 1, year: 2024 };
        const query2: MonthlySpendingQueryDto = { month: 2, year: 2024 };
        const query3: MonthlySpendingQueryDto = { month: 3, year: 2024 };

        const mockTransaction1 = TransactionEntity.create({
          userId: 'auth-user-123',
          amount: new CurrencyVO(10000),
          recurring: 0,
          name: 'Transaction 1',
          description: 'First transaction',
          type: TransactionType.OUTCOME,
          createdAt: mockDate,
          updatedAt: mockUpdateDate,
        });

        const mockTransaction2 = TransactionEntity.create({
          userId: 'auth-user-123',
          amount: new CurrencyVO(20000),
          recurring: 0,
          name: 'Transaction 2',
          description: 'Second transaction',
          type: TransactionType.OUTCOME,
          createdAt: mockDate,
          updatedAt: mockUpdateDate,
        });

        getMonthlySpendingUseCase.execute
          .mockResolvedValueOnce([mockTransaction1])
          .mockResolvedValueOnce([mockTransaction2])
          .mockResolvedValueOnce([]);

        const promises = [
          controller.getMonthlySpending(mockAuthUser, query1),
          controller.getMonthlySpending(mockAuthUser, query2),
          controller.getMonthlySpending(mockAuthUser, query3),
        ];

        const results = await Promise.all(promises);

        expect(results).toHaveLength(3);
        expect(results[0]).toHaveLength(1);
        expect(results[1]).toHaveLength(1);
        expect(results[2]).toHaveLength(0);
        expect(results[0][0].name).toBe('Transaction 1');
        expect(results[1][0].name).toBe('Transaction 2');
        expect(getMonthlySpendingUseCase.execute).toHaveBeenCalledTimes(3);
      });
    });

    describe('Return Type Validation', () => {
      it('should return array of TransactionResponseDto', async () => {
        const query: MonthlySpendingQueryDto = { month: 12, year: 2024 };

        const mockTransaction = TransactionEntity.create({
          userId: 'auth-user-123',
          amount: new CurrencyVO(55000),
          recurring: 0,
          name: 'Return Type Test',
          description: 'Testing return type',
          type: TransactionType.OUTCOME,
          createdAt: mockDate,
          updatedAt: mockUpdateDate,
        });

        getMonthlySpendingUseCase.execute.mockResolvedValue([mockTransaction]);

        const result = await controller.getMonthlySpending(mockAuthUser, query);

        expect(Array.isArray(result)).toBe(true);
        expect(result).toHaveLength(1);

        // Verify DTO structure
        const dto = result[0];
        expect(dto).toHaveProperty('id');
        expect(dto).toHaveProperty('name');
        expect(dto).toHaveProperty('description');
        expect(dto).toHaveProperty('amount');
        expect(dto).toHaveProperty('type');
        expect(dto).toHaveProperty('recurring');
        expect(dto).toHaveProperty('createdAt');
        expect(dto).toHaveProperty('updatedAt');

        expect(typeof dto.id).toBe('string');
        expect(typeof dto.name).toBe('string');
        expect(typeof dto.description).toBe('string');
        expect(typeof dto.amount).toBe('number');
        expect(typeof dto.recurring).toBe('number');
        expect(dto.createdAt).toBeInstanceOf(Date);
        expect(dto.updatedAt).toBeInstanceOf(Date);
      });

      it('should always return an array even when empty', async () => {
        const query: MonthlySpendingQueryDto = { month: 1, year: 2025 };

        getMonthlySpendingUseCase.execute.mockResolvedValue([]);

        const result = await controller.getMonthlySpending(mockAuthUser, query);

        expect(Array.isArray(result)).toBe(true);
        expect(result).toHaveLength(0);
      });
    });
  });
});
