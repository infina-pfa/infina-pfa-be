import { Test, TestingModule } from '@nestjs/testing';
import {
  TransactionEntity,
  TransactionType,
} from '@/budgeting/domain/entities/transactions.entity';
import { TransactionRepository } from '@/budgeting/domain/repositories/transaction.repository';
import { CurrencyVO } from '@/common/base';
import { GetMonthlySpendingUseCase } from '../get-monthly-spending.use-case';

describe('GetMonthlySpendingUseCase', () => {
  let useCase: GetMonthlySpendingUseCase;
  let transactionRepository: jest.Mocked<TransactionRepository>;

  const mockDate = new Date('2024-03-15T10:00:00Z');

  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(async () => {
    const mockTransactionRepository = {
      findBudgetSpendingByMonth: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findOne: jest.fn(),
      findMany: jest.fn(),
      findById: jest.fn(),
      createMany: jest.fn(),
      toEntity: jest.fn(),
      toORM: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetMonthlySpendingUseCase,
        {
          provide: TransactionRepository,
          useValue: mockTransactionRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetMonthlySpendingUseCase>(GetMonthlySpendingUseCase);
    transactionRepository = module.get(TransactionRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    describe('Happy Path', () => {
      it('should return monthly spending transactions for valid input', async () => {
        const input = {
          userId: 'user-123',
          month: 3,
          year: 2024,
        };

        const mockTransactions = [
          TransactionEntity.create({
            userId: 'user-123',
            amount: new CurrencyVO(50000),
            recurring: 0,
            name: 'Grocery Shopping',
            description: 'Weekly groceries',
            type: TransactionType.BUDGET_SPENDING,
            createdAt: new Date('2024-03-10T00:00:00Z'),
            updatedAt: new Date('2024-03-10T00:00:00Z'),
          }),
          TransactionEntity.create({
            userId: 'user-123',
            amount: new CurrencyVO(30000),
            recurring: 0,
            name: 'Gas Station',
            description: 'Fuel',
            type: TransactionType.BUDGET_SPENDING,
            createdAt: new Date('2024-03-12T00:00:00Z'),
            updatedAt: new Date('2024-03-12T00:00:00Z'),
          }),
        ];

        transactionRepository.findBudgetSpendingByMonth.mockResolvedValue(
          mockTransactions,
        );

        const result = await useCase.execute(input);

        expect(
          transactionRepository.findBudgetSpendingByMonth,
        ).toHaveBeenCalledWith('user-123', 3, 2024);
        expect(result).toEqual(mockTransactions);
        expect(result).toHaveLength(2);
        expect(result[0]).toBeInstanceOf(TransactionEntity);
        expect(result[1]).toBeInstanceOf(TransactionEntity);
      });

      it('should return empty array when no transactions found', async () => {
        const input = {
          userId: 'user-no-transactions',
          month: 3,
          year: 2024,
        };

        transactionRepository.findBudgetSpendingByMonth.mockResolvedValue([]);

        const result = await useCase.execute(input);

        expect(
          transactionRepository.findBudgetSpendingByMonth,
        ).toHaveBeenCalledWith('user-no-transactions', 3, 2024);
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
          const input = {
            userId: 'user-different-months',
            month,
            year,
          };

          const mockTransaction = TransactionEntity.create({
            userId: 'user-different-months',
            amount: new CurrencyVO(25000),
            recurring: 0,
            name: `Transaction ${month}/${year}`,
            description: `Test transaction for ${month}/${year}`,
            type: TransactionType.BUDGET_SPENDING,
            createdAt: new Date(year, month - 1, 15),
            updatedAt: new Date(year, month - 1, 15),
          });

          transactionRepository.findBudgetSpendingByMonth.mockResolvedValue([
            mockTransaction,
          ]);

          const result = await useCase.execute(input);

          expect(
            transactionRepository.findBudgetSpendingByMonth,
          ).toHaveBeenCalledWith('user-different-months', month, year);
          expect(result).toHaveLength(1);
          expect(result[0].props.name).toBe(`Transaction ${month}/${year}`);

          jest.clearAllMocks();
        }
      });

      it('should handle different years correctly', async () => {
        const testCases = [2023, 2024, 2025];

        for (const year of testCases) {
          const input = {
            userId: 'user-different-years',
            month: 6,
            year,
          };

          const mockTransaction = TransactionEntity.create({
            userId: 'user-different-years',
            amount: new CurrencyVO(40000),
            recurring: 0,
            name: `Transaction ${year}`,
            description: `Test transaction for year ${year}`,
            type: TransactionType.BUDGET_SPENDING,
            createdAt: new Date(year, 5, 15),
            updatedAt: new Date(year, 5, 15),
          });

          transactionRepository.findBudgetSpendingByMonth.mockResolvedValue([
            mockTransaction,
          ]);

          const result = await useCase.execute(input);

          expect(
            transactionRepository.findBudgetSpendingByMonth,
          ).toHaveBeenCalledWith('user-different-years', 6, year);
          expect(result).toHaveLength(1);
          expect(result[0].props.name).toBe(`Transaction ${year}`);

          jest.clearAllMocks();
        }
      });

      it('should handle different user IDs correctly', async () => {
        const testUsers = ['user-1', 'user-2', 'different-user-id'];

        for (const userId of testUsers) {
          const input = {
            userId,
            month: 3,
            year: 2024,
          };

          const mockTransaction = TransactionEntity.create({
            userId,
            amount: new CurrencyVO(35000),
            recurring: 0,
            name: `Transaction for ${userId}`,
            description: `Test transaction for ${userId}`,
            type: TransactionType.BUDGET_SPENDING,
            createdAt: new Date('2024-03-10T00:00:00Z'),
            updatedAt: new Date('2024-03-10T00:00:00Z'),
          });

          transactionRepository.findBudgetSpendingByMonth.mockResolvedValue([
            mockTransaction,
          ]);

          const result = await useCase.execute(input);

          expect(
            transactionRepository.findBudgetSpendingByMonth,
          ).toHaveBeenCalledWith(userId, 3, 2024);
          expect(result).toHaveLength(1);
          expect(result[0].props.userId).toBe(userId);

          jest.clearAllMocks();
        }
      });

      it('should return transactions in order from repository', async () => {
        const input = {
          userId: 'user-order-test',
          month: 3,
          year: 2024,
        };

        const mockTransactions = [
          TransactionEntity.create({
            userId: 'user-order-test',
            amount: new CurrencyVO(10000),
            recurring: 0,
            name: 'First Transaction',
            description: 'First',
            type: TransactionType.BUDGET_SPENDING,
            createdAt: new Date('2024-03-01T00:00:00Z'),
            updatedAt: new Date('2024-03-01T00:00:00Z'),
          }),
          TransactionEntity.create({
            userId: 'user-order-test',
            amount: new CurrencyVO(20000),
            recurring: 0,
            name: 'Second Transaction',
            description: 'Second',
            type: TransactionType.BUDGET_SPENDING,
            createdAt: new Date('2024-03-15T00:00:00Z'),
            updatedAt: new Date('2024-03-15T00:00:00Z'),
          }),
          TransactionEntity.create({
            userId: 'user-order-test',
            amount: new CurrencyVO(30000),
            recurring: 0,
            name: 'Third Transaction',
            description: 'Third',
            type: TransactionType.BUDGET_SPENDING,
            createdAt: new Date('2024-03-30T00:00:00Z'),
            updatedAt: new Date('2024-03-30T00:00:00Z'),
          }),
        ];

        transactionRepository.findBudgetSpendingByMonth.mockResolvedValue(
          mockTransactions,
        );

        const result = await useCase.execute(input);

        expect(result).toEqual(mockTransactions);
        expect(result[0].props.name).toBe('First Transaction');
        expect(result[1].props.name).toBe('Second Transaction');
        expect(result[2].props.name).toBe('Third Transaction');
      });

      it('should handle large number of transactions', async () => {
        const input = {
          userId: 'user-many-transactions',
          month: 3,
          year: 2024,
        };

        // Create 50 mock transactions
        const mockTransactions = Array.from({ length: 50 }, (_, index) =>
          TransactionEntity.create({
            userId: 'user-many-transactions',
            amount: new CurrencyVO((index + 1) * 1000),
            recurring: 0,
            name: `Transaction ${index + 1}`,
            description: `Description ${index + 1}`,
            type: TransactionType.BUDGET_SPENDING,
            createdAt: new Date('2024-03-10T00:00:00Z'),
            updatedAt: new Date('2024-03-10T00:00:00Z'),
          }),
        );

        transactionRepository.findBudgetSpendingByMonth.mockResolvedValue(
          mockTransactions,
        );

        const result = await useCase.execute(input);

        expect(result).toHaveLength(50);
        expect(result[0].props.name).toBe('Transaction 1');
        expect(result[49].props.name).toBe('Transaction 50');
      });
    });

    describe('Edge Cases and Input Validation', () => {
      it('should handle edge month values (1 and 12)', async () => {
        const testCases = [1, 12];

        for (const month of testCases) {
          const input = {
            userId: 'user-edge-months',
            month,
            year: 2024,
          };

          transactionRepository.findBudgetSpendingByMonth.mockResolvedValue([]);

          const result = await useCase.execute(input);

          expect(
            transactionRepository.findBudgetSpendingByMonth,
          ).toHaveBeenCalledWith('user-edge-months', month, 2024);
          expect(result).toEqual([]);

          jest.clearAllMocks();
        }
      });

      it('should handle minimum and maximum year values', async () => {
        const testCases = [1900, 3000];

        for (const year of testCases) {
          const input = {
            userId: 'user-edge-years',
            month: 6,
            year,
          };

          transactionRepository.findBudgetSpendingByMonth.mockResolvedValue([]);

          const result = await useCase.execute(input);

          expect(
            transactionRepository.findBudgetSpendingByMonth,
          ).toHaveBeenCalledWith('user-edge-years', 6, year);
          expect(result).toEqual([]);

          jest.clearAllMocks();
        }
      });

      it('should handle empty user ID', async () => {
        const input = {
          userId: '',
          month: 3,
          year: 2024,
        };

        transactionRepository.findBudgetSpendingByMonth.mockResolvedValue([]);

        const result = await useCase.execute(input);

        expect(
          transactionRepository.findBudgetSpendingByMonth,
        ).toHaveBeenCalledWith('', 3, 2024);
        expect(result).toEqual([]);
      });

      it('should handle very long user ID', async () => {
        const longUserId = 'user-' + 'a'.repeat(1000);
        const input = {
          userId: longUserId,
          month: 3,
          year: 2024,
        };

        transactionRepository.findBudgetSpendingByMonth.mockResolvedValue([]);

        const result = await useCase.execute(input);

        expect(
          transactionRepository.findBudgetSpendingByMonth,
        ).toHaveBeenCalledWith(longUserId, 3, 2024);
        expect(result).toEqual([]);
      });
    });

    describe('Repository Integration', () => {
      it('should call repository method exactly once with correct parameters', async () => {
        const input = {
          userId: 'user-integration',
          month: 7,
          year: 2024,
        };

        transactionRepository.findBudgetSpendingByMonth.mockResolvedValue([]);

        await useCase.execute(input);

        expect(
          transactionRepository.findBudgetSpendingByMonth,
        ).toHaveBeenCalledTimes(1);
        expect(
          transactionRepository.findBudgetSpendingByMonth,
        ).toHaveBeenCalledWith('user-integration', 7, 2024);
      });

      it('should not call any other repository methods', async () => {
        const input = {
          userId: 'user-method-isolation',
          month: 8,
          year: 2024,
        };

        transactionRepository.findBudgetSpendingByMonth.mockResolvedValue([]);

        await useCase.execute(input);

        expect(transactionRepository.create).not.toHaveBeenCalled();
        expect(transactionRepository.update).not.toHaveBeenCalled();
        expect(transactionRepository.delete).not.toHaveBeenCalled();
        expect(transactionRepository.findOne).not.toHaveBeenCalled();
        expect(transactionRepository.findMany).not.toHaveBeenCalled();
        expect(transactionRepository.findById).not.toHaveBeenCalled();
        expect(transactionRepository.createMany).not.toHaveBeenCalled();
      });

      it('should propagate repository errors', async () => {
        const input = {
          userId: 'user-error',
          month: 9,
          year: 2024,
        };

        const repositoryError = new Error('Database connection failed');
        transactionRepository.findBudgetSpendingByMonth.mockRejectedValue(
          repositoryError,
        );

        await expect(useCase.execute(input)).rejects.toThrow(
          'Database connection failed',
        );
        expect(
          transactionRepository.findBudgetSpendingByMonth,
        ).toHaveBeenCalledTimes(1);
      });

      it('should handle repository timeout errors', async () => {
        const input = {
          userId: 'user-timeout',
          month: 10,
          year: 2024,
        };

        const timeoutError = new Error('Query timeout');
        transactionRepository.findBudgetSpendingByMonth.mockRejectedValue(
          timeoutError,
        );

        await expect(useCase.execute(input)).rejects.toThrow('Query timeout');
      });

      it('should handle repository connection errors', async () => {
        const input = {
          userId: 'user-connection-error',
          month: 11,
          year: 2024,
        };

        const connectionError = new Error('Connection refused');
        transactionRepository.findBudgetSpendingByMonth.mockRejectedValue(
          connectionError,
        );

        await expect(useCase.execute(input)).rejects.toThrow(
          'Connection refused',
        );
      });

      it('should handle repository null response gracefully', async () => {
        const input = {
          userId: 'user-null-response',
          month: 12,
          year: 2024,
        };

        transactionRepository.findBudgetSpendingByMonth.mockResolvedValue(
          null as any,
        );

        const result = await useCase.execute(input);

        expect(result).toBeNull();
      });

      it('should handle repository undefined response gracefully', async () => {
        const input = {
          userId: 'user-undefined-response',
          month: 1,
          year: 2025,
        };

        transactionRepository.findBudgetSpendingByMonth.mockResolvedValue(
          undefined as any,
        );

        const result = await useCase.execute(input);

        expect(result).toBeUndefined();
      });
    });

    describe('Business Logic Validation', () => {
      it('should return only budget-linked outcome transactions', async () => {
        const input = {
          userId: 'user-business-logic',
          month: 3,
          year: 2024,
        };

        // Mock transactions should all be outcome type from budget spending
        const mockTransactions = [
          TransactionEntity.create({
            userId: 'user-business-logic',
            amount: new CurrencyVO(45000),
            recurring: 0,
            name: 'Budget Spending 1',
            description: 'Budget-linked outcome transaction',
            type: TransactionType.BUDGET_SPENDING,
            createdAt: new Date('2024-03-05T00:00:00Z'),
            updatedAt: new Date('2024-03-05T00:00:00Z'),
          }),
          TransactionEntity.create({
            userId: 'user-business-logic',
            amount: new CurrencyVO(60000),
            recurring: 0,
            name: 'Budget Spending 2',
            description: 'Another budget-linked outcome transaction',
            type: TransactionType.BUDGET_SPENDING,
            createdAt: new Date('2024-03-15T00:00:00Z'),
            updatedAt: new Date('2024-03-15T00:00:00Z'),
          }),
        ];

        transactionRepository.findBudgetSpendingByMonth.mockResolvedValue(
          mockTransactions,
        );

        const result = await useCase.execute(input);

        expect(result).toHaveLength(2);
        result.forEach((transaction) => {
          expect(transaction.props.type).toBe(TransactionType.BUDGET_SPENDING);
          expect(transaction.props.userId).toBe('user-business-logic');
        });
      });

      it('should delegate month/year filtering to repository', async () => {
        const input = {
          userId: 'user-date-filtering',
          month: 2,
          year: 2024,
        };

        // The use case should delegate date filtering to the repository
        // and not perform any additional filtering
        const mockTransactions = [
          TransactionEntity.create({
            userId: 'user-date-filtering',
            amount: new CurrencyVO(20000),
            recurring: 0,
            name: 'February Transaction',
            description: 'Transaction in February 2024',
            type: TransactionType.BUDGET_SPENDING,
            createdAt: new Date('2024-02-14T00:00:00Z'),
            updatedAt: new Date('2024-02-14T00:00:00Z'),
          }),
        ];

        transactionRepository.findBudgetSpendingByMonth.mockResolvedValue(
          mockTransactions,
        );

        const result = await useCase.execute(input);

        expect(
          transactionRepository.findBudgetSpendingByMonth,
        ).toHaveBeenCalledWith('user-date-filtering', 2, 2024);
        expect(result).toEqual(mockTransactions);
      });

      it('should preserve transaction entity properties', async () => {
        const input = {
          userId: 'user-properties',
          month: 4,
          year: 2024,
        };

        const originalTransaction = TransactionEntity.create({
          userId: 'user-properties',
          amount: new CurrencyVO(75000),
          recurring: 1,
          name: 'Monthly Subscription',
          description: 'Recurring monthly payment',
          type: TransactionType.BUDGET_SPENDING,
          createdAt: new Date('2024-04-01T00:00:00Z'),
          updatedAt: new Date('2024-04-01T00:00:00Z'),
        });

        transactionRepository.findBudgetSpendingByMonth.mockResolvedValue([
          originalTransaction,
        ]);

        const result = await useCase.execute(input);

        expect(result).toHaveLength(1);
        const resultTransaction = result[0];
        expect(resultTransaction.props.userId).toBe('user-properties');
        expect(resultTransaction.props.amount.value).toBe(75000);
        expect(resultTransaction.props.recurring).toBe(1);
        expect(resultTransaction.props.name).toBe('Monthly Subscription');
        expect(resultTransaction.props.description).toBe(
          'Recurring monthly payment',
        );
        expect(resultTransaction.props.type).toBe(
          TransactionType.BUDGET_SPENDING,
        );
        expect(resultTransaction.props.createdAt).toEqual(
          new Date('2024-04-01T00:00:00Z'),
        );
        expect(resultTransaction.props.updatedAt).toEqual(
          new Date('2024-04-01T00:00:00Z'),
        );
      });
    });

    describe('Concurrent Execution', () => {
      it('should handle concurrent requests for different users', async () => {
        const inputs = [
          { userId: 'user-1', month: 3, year: 2024 },
          { userId: 'user-2', month: 3, year: 2024 },
          { userId: 'user-3', month: 3, year: 2024 },
        ];

        // Mock different responses for each user
        const mockResponses = [
          [
            TransactionEntity.create({
              userId: 'user-1',
              amount: new CurrencyVO(10000),
              recurring: 0,
              name: 'User 1 Transaction',
              description: 'Transaction for user 1',
              type: TransactionType.BUDGET_SPENDING,
              createdAt: mockDate,
              updatedAt: mockDate,
            }),
          ],
          [
            TransactionEntity.create({
              userId: 'user-2',
              amount: new CurrencyVO(20000),
              recurring: 0,
              name: 'User 2 Transaction',
              description: 'Transaction for user 2',
              type: TransactionType.BUDGET_SPENDING,
              createdAt: mockDate,
              updatedAt: mockDate,
            }),
          ],
          [],
        ];

        transactionRepository.findBudgetSpendingByMonth
          .mockResolvedValueOnce(mockResponses[0])
          .mockResolvedValueOnce(mockResponses[1])
          .mockResolvedValueOnce(mockResponses[2]);

        const promises = inputs.map((input) => useCase.execute(input));
        const results = await Promise.all(promises);

        expect(results).toHaveLength(3);
        expect(results[0]).toHaveLength(1);
        expect(results[1]).toHaveLength(1);
        expect(results[2]).toHaveLength(0);
        expect(results[0][0].props.userId).toBe('user-1');
        expect(results[1][0].props.userId).toBe('user-2');
      });

      it('should handle concurrent requests for different months', async () => {
        const inputs = [
          { userId: 'user-concurrent', month: 1, year: 2024 },
          { userId: 'user-concurrent', month: 2, year: 2024 },
          { userId: 'user-concurrent', month: 3, year: 2024 },
        ];

        transactionRepository.findBudgetSpendingByMonth.mockResolvedValue([]);

        const promises = inputs.map((input) => useCase.execute(input));
        await Promise.all(promises);

        expect(
          transactionRepository.findBudgetSpendingByMonth,
        ).toHaveBeenCalledTimes(3);
        expect(
          transactionRepository.findBudgetSpendingByMonth,
        ).toHaveBeenCalledWith('user-concurrent', 1, 2024);
        expect(
          transactionRepository.findBudgetSpendingByMonth,
        ).toHaveBeenCalledWith('user-concurrent', 2, 2024);
        expect(
          transactionRepository.findBudgetSpendingByMonth,
        ).toHaveBeenCalledWith('user-concurrent', 3, 2024);
      });
    });
  });
});
