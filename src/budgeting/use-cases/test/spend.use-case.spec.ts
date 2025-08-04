import { Test, TestingModule } from '@nestjs/testing';
import { Currency } from '@/common/types/user';
import { CurrencyVO } from '@/common/base';
import {
  BudgetCategory,
  BudgetEntity,
} from '../../domain/entities/budget.entity';
import { BudgetAggregate } from '../../domain/entities/budget.aggregate';
import { BudgetAggregateRepository } from '../../domain/repositories/budget-aggregate.repository';
import { BudgetErrorFactory } from '../../domain/errors';
import { TransactionsWatchList } from '../../domain/watch-list/transactions.watch-list';
import { SpendUseCase } from '../spend.use-case';

describe('SpendUseCase', () => {
  let useCase: SpendUseCase;
  let budgetAggregateRepository: jest.Mocked<BudgetAggregateRepository>;

  const mockDate = new Date('2024-01-01T00:00:00Z');

  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(async () => {
    const mockBudgetAggregateRepository = {
      findById: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpendUseCase,
        {
          provide: BudgetAggregateRepository,
          useValue: mockBudgetAggregateRepository,
        },
      ],
    }).compile();

    useCase = module.get<SpendUseCase>(SpendUseCase);
    budgetAggregateRepository = module.get(BudgetAggregateRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    describe('Happy Path', () => {
      it('should add spending to budget aggregate with all parameters', async () => {
        const budgetEntity = BudgetEntity.create({
          name: 'Food Budget',
          amount: new CurrencyVO(1000, Currency.USD),
          userId: 'user-123',
          category: BudgetCategory.FLEXIBLE,
          color: '#FF5733',
          icon: 'food',
          month: 1,
          year: 2024,
          archivedAt: null,
          createdAt: mockDate,
          updatedAt: mockDate,
        });

        const budgetAggregate = BudgetAggregate.create({
          budget: budgetEntity,
          spending: new TransactionsWatchList([]),
        });

        const spendSpy = jest.spyOn(budgetAggregate, 'spend');

        const input = {
          budgetId: 'budget-123',
          userId: 'user-123',
          amount: 50,
          name: 'Grocery Shopping',
          description: 'Weekly grocery shopping at supermarket',
          recurring: 0,
        };

        budgetAggregateRepository.findById.mockResolvedValue(budgetAggregate);
        budgetAggregateRepository.save.mockResolvedValue(undefined);

        await useCase.execute(input);

        expect(budgetAggregateRepository.findById).toHaveBeenCalledWith(
          'budget-123',
        );
        expect(spendSpy).toHaveBeenCalledWith({
          amount: expect.any(CurrencyVO),
          name: 'Grocery Shopping',
          description: 'Weekly grocery shopping at supermarket',
          recurring: 0,
        });
        expect(spendSpy.mock.calls[0][0].amount.value).toBe(50);
        expect(budgetAggregateRepository.save).toHaveBeenCalledWith(
          budgetAggregate,
        );
      });

      it('should add spending with minimal parameters', async () => {
        const budgetEntity = BudgetEntity.create({
          name: 'Transport Budget',
          amount: new CurrencyVO(500, Currency.VND),
          userId: 'user-456',
          category: BudgetCategory.FIXED,
          color: '#33FF57',
          icon: 'transport',
          month: 2,
          year: 2024,
          archivedAt: null,
          createdAt: mockDate,
          updatedAt: mockDate,
        });

        const budgetAggregate = BudgetAggregate.create({
          budget: budgetEntity,
          spending: new TransactionsWatchList([]),
        });

        const spendSpy = jest.spyOn(budgetAggregate, 'spend');

        const input = {
          budgetId: 'budget-456',
          userId: 'user-456',
          amount: 25,
        };

        budgetAggregateRepository.findById.mockResolvedValue(budgetAggregate);
        budgetAggregateRepository.save.mockResolvedValue(undefined);

        await useCase.execute(input);

        expect(spendSpy).toHaveBeenCalledWith({
          amount: expect.any(CurrencyVO),
          name: undefined,
          description: undefined,
          recurring: undefined,
        });
        expect(spendSpy.mock.calls[0][0].amount.value).toBe(25);
      });

      it('should handle different spending amounts', async () => {
        const testCases = [1, 10, 100, 500, 1000, 5000];

        for (const amount of testCases) {
          const budgetEntity = BudgetEntity.create({
            name: `Test Budget ${amount}`,
            amount: new CurrencyVO(10000, Currency.EUR),
            userId: 'user-amount-test',
            category: BudgetCategory.FLEXIBLE,
            color: '#5733FF',
            icon: 'amount-test',
            month: 3,
            year: 2024,
            archivedAt: null,
            createdAt: mockDate,
            updatedAt: mockDate,
          });

          const budgetAggregate = BudgetAggregate.create({
            budget: budgetEntity,
            spending: new TransactionsWatchList([]),
          });

          const spendSpy = jest.spyOn(budgetAggregate, 'spend');

          const input = {
            budgetId: `budget-${amount}`,
            userId: 'user-amount-test',
            amount,
            name: `Spending ${amount}`,
          };

          budgetAggregateRepository.findById.mockResolvedValue(budgetAggregate);
          budgetAggregateRepository.save.mockResolvedValue(undefined);

          await useCase.execute(input);

          expect(spendSpy.mock.calls[0][0].amount.value).toBe(amount);

          jest.clearAllMocks();
        }
      });

      it('should handle different recurring values', async () => {
        const testCases = [0, 1, 7, 30, 365];

        for (const recurring of testCases) {
          const budgetEntity = BudgetEntity.create({
            name: `Recurring Test Budget ${recurring}`,
            amount: new CurrencyVO(2000, Currency.USD),
            userId: 'user-recurring-test',
            category: BudgetCategory.FIXED,
            color: '#FF3357',
            icon: 'recurring-test',
            month: 4,
            year: 2024,
            archivedAt: null,
            createdAt: mockDate,
            updatedAt: mockDate,
          });

          const budgetAggregate = BudgetAggregate.create({
            budget: budgetEntity,
            spending: new TransactionsWatchList([]),
          });

          const spendSpy = jest.spyOn(budgetAggregate, 'spend');

          const input = {
            budgetId: `budget-recurring-${recurring}`,
            userId: 'user-recurring-test',
            amount: 100,
            name: `Recurring ${recurring} Spending`,
            recurring,
          };

          budgetAggregateRepository.findById.mockResolvedValue(budgetAggregate);
          budgetAggregateRepository.save.mockResolvedValue(undefined);

          await useCase.execute(input);

          expect(spendSpy.mock.calls[0][0].recurring).toBe(recurring);

          jest.clearAllMocks();
        }
      });

      it('should handle different name and description combinations', async () => {
        const testCases = [
          { name: 'Coffee', description: 'Morning coffee at cafe' },
          { name: '', description: 'Empty name spending' },
          { name: 'Lunch', description: '' },
          {
            name: 'Very long spending name with many characters',
            description:
              'Very long description with detailed information about the spending transaction',
          },
        ];

        for (const { name, description } of testCases) {
          const budgetEntity = BudgetEntity.create({
            name: 'Text Test Budget',
            amount: new CurrencyVO(1500, Currency.VND),
            userId: 'user-text-test',
            category: BudgetCategory.FLEXIBLE,
            color: '#123456',
            icon: 'text-test',
            month: 5,
            year: 2024,
            archivedAt: null,
            createdAt: mockDate,
            updatedAt: mockDate,
          });

          const budgetAggregate = BudgetAggregate.create({
            budget: budgetEntity,
            spending: new TransactionsWatchList([]),
          });

          const spendSpy = jest.spyOn(budgetAggregate, 'spend');

          const input = {
            budgetId: 'budget-text-test',
            userId: 'user-text-test',
            amount: 30,
            name,
            description,
          };

          budgetAggregateRepository.findById.mockResolvedValue(budgetAggregate);
          budgetAggregateRepository.save.mockResolvedValue(undefined);

          await useCase.execute(input);

          expect(spendSpy.mock.calls[0][0].name).toBe(name);
          expect(spendSpy.mock.calls[0][0].description).toBe(description);

          jest.clearAllMocks();
        }
      });

      it('should work with zero amount spending', async () => {
        const budgetEntity = BudgetEntity.create({
          name: 'Zero Amount Budget',
          amount: new CurrencyVO(1000, Currency.EUR),
          userId: 'user-zero',
          category: BudgetCategory.FLEXIBLE,
          color: '#789ABC',
          icon: 'zero',
          month: 6,
          year: 2024,
          archivedAt: null,
          createdAt: mockDate,
          updatedAt: mockDate,
        });

        const budgetAggregate = BudgetAggregate.create({
          budget: budgetEntity,
          spending: new TransactionsWatchList([]),
        });

        const spendSpy = jest.spyOn(budgetAggregate, 'spend');

        const input = {
          budgetId: 'budget-zero',
          userId: 'user-zero',
          amount: 0,
          name: 'Zero Amount Transaction',
        };

        budgetAggregateRepository.findById.mockResolvedValue(budgetAggregate);
        budgetAggregateRepository.save.mockResolvedValue(undefined);

        await useCase.execute(input);

        expect(spendSpy.mock.calls[0][0].amount.value).toBe(0);
      });

      it('should handle large spending amounts', async () => {
        const budgetEntity = BudgetEntity.create({
          name: 'Large Amount Budget',
          amount: new CurrencyVO(1000000, Currency.USD),
          userId: 'user-large',
          category: BudgetCategory.FIXED,
          color: '#ABCDEF',
          icon: 'large',
          month: 7,
          year: 2024,
          archivedAt: null,
          createdAt: mockDate,
          updatedAt: mockDate,
        });

        const budgetAggregate = BudgetAggregate.create({
          budget: budgetEntity,
          spending: new TransactionsWatchList([]),
        });

        const spendSpy = jest.spyOn(budgetAggregate, 'spend');

        const input = {
          budgetId: 'budget-large',
          userId: 'user-large',
          amount: 999999,
          name: 'Large Purchase',
          description: 'Very expensive item',
        };

        budgetAggregateRepository.findById.mockResolvedValue(budgetAggregate);
        budgetAggregateRepository.save.mockResolvedValue(undefined);

        await useCase.execute(input);

        expect(spendSpy.mock.calls[0][0].amount.value).toBe(999999);
      });
    });

    describe('Error Cases', () => {
      it('should throw BudgetErrorFactory.budgetNotFound when budget does not exist', async () => {
        const input = {
          budgetId: 'non-existent-budget',
          userId: 'user-123',
          amount: 50,
          name: 'Test Spending',
        };

        budgetAggregateRepository.findById.mockResolvedValue(null);

        await expect(useCase.execute(input)).rejects.toThrow(
          BudgetErrorFactory.budgetNotFound(),
        );

        expect(budgetAggregateRepository.findById).toHaveBeenCalledWith(
          'non-existent-budget',
        );
        expect(budgetAggregateRepository.save).not.toHaveBeenCalled();
      });

      it('should propagate repository findById errors', async () => {
        const input = {
          budgetId: 'budget-error',
          userId: 'user-error',
          amount: 100,
          name: 'Error Test Spending',
        };

        const repositoryError = new Error('Database connection failed');
        budgetAggregateRepository.findById.mockRejectedValue(repositoryError);

        await expect(useCase.execute(input)).rejects.toThrow(
          'Database connection failed',
        );
        expect(budgetAggregateRepository.findById).toHaveBeenCalledWith(
          'budget-error',
        );
        expect(budgetAggregateRepository.save).not.toHaveBeenCalled();
      });

      it('should propagate repository save errors', async () => {
        const budgetEntity = BudgetEntity.create({
          name: 'Save Error Budget',
          amount: new CurrencyVO(1000, Currency.USD),
          userId: 'user-save-error',
          category: BudgetCategory.FLEXIBLE,
          color: '#FF5733',
          icon: 'save-error',
          month: 8,
          year: 2024,
          archivedAt: null,
          createdAt: mockDate,
          updatedAt: mockDate,
        });

        const budgetAggregate = BudgetAggregate.create({
          budget: budgetEntity,
          spending: new TransactionsWatchList([]),
        });

        const input = {
          budgetId: 'budget-save-error',
          userId: 'user-save-error',
          amount: 75,
          name: 'Save Error Spending',
        };

        const saveError = new Error('Database save failed');
        budgetAggregateRepository.findById.mockResolvedValue(budgetAggregate);
        budgetAggregateRepository.save.mockRejectedValue(saveError);

        await expect(useCase.execute(input)).rejects.toThrow(
          'Database save failed',
        );
        expect(budgetAggregateRepository.findById).toHaveBeenCalledWith(
          'budget-save-error',
        );
        expect(budgetAggregateRepository.save).toHaveBeenCalledTimes(1);
      });
    });

    describe('Repository Integration', () => {
      it('should call repository methods in correct order', async () => {
        const budgetEntity = BudgetEntity.create({
          name: 'Integration Test Budget',
          amount: new CurrencyVO(1200, Currency.VND),
          userId: 'user-integration',
          category: BudgetCategory.FIXED,
          color: '#FEDCBA',
          icon: 'integration',
          month: 9,
          year: 2024,
          archivedAt: null,
          createdAt: mockDate,
          updatedAt: mockDate,
        });

        const budgetAggregate = BudgetAggregate.create({
          budget: budgetEntity,
          spending: new TransactionsWatchList([]),
        });

        const input = {
          budgetId: 'budget-integration',
          userId: 'user-integration',
          amount: 80,
          name: 'Integration Test Spending',
        };

        budgetAggregateRepository.findById.mockResolvedValue(budgetAggregate);
        budgetAggregateRepository.save.mockResolvedValue(undefined);

        await useCase.execute(input);

        expect(budgetAggregateRepository.findById).toHaveBeenCalledWith(
          'budget-integration',
        );
        expect(budgetAggregateRepository.save).toHaveBeenCalledWith(
          budgetAggregate,
        );
      });

      it('should pass correct CurrencyVO to spend method', async () => {
        const budgetEntity = BudgetEntity.create({
          name: 'Currency Test Budget',
          amount: new CurrencyVO(1300, Currency.EUR),
          userId: 'user-currency',
          category: BudgetCategory.FLEXIBLE,
          color: '#111222',
          icon: 'currency',
          month: 10,
          year: 2024,
          archivedAt: null,
          createdAt: mockDate,
          updatedAt: mockDate,
        });

        const budgetAggregate = BudgetAggregate.create({
          budget: budgetEntity,
          spending: new TransactionsWatchList([]),
        });

        const spendSpy = jest.spyOn(budgetAggregate, 'spend');

        const input = {
          budgetId: 'budget-currency',
          userId: 'user-currency',
          amount: 125,
          name: 'Currency Test Spending',
        };

        budgetAggregateRepository.findById.mockResolvedValue(budgetAggregate);
        budgetAggregateRepository.save.mockResolvedValue(undefined);

        await useCase.execute(input);

        expect(spendSpy.mock.calls[0][0].amount).toBeInstanceOf(CurrencyVO);
        expect(spendSpy.mock.calls[0][0].amount.value).toBe(125);
        expect(spendSpy.mock.calls[0][0].amount.currency).toBe(Currency.VND);
      });

      it('should not return any value', async () => {
        const budgetEntity = BudgetEntity.create({
          name: 'Void Return Budget',
          amount: new CurrencyVO(1400, Currency.USD),
          userId: 'user-void',
          category: BudgetCategory.FIXED,
          color: '#333444',
          icon: 'void',
          month: 11,
          year: 2024,
          archivedAt: null,
          createdAt: mockDate,
          updatedAt: mockDate,
        });

        const budgetAggregate = BudgetAggregate.create({
          budget: budgetEntity,
          spending: new TransactionsWatchList([]),
        });

        const input = {
          budgetId: 'budget-void',
          userId: 'user-void',
          amount: 150,
          name: 'Void Return Spending',
        };

        budgetAggregateRepository.findById.mockResolvedValue(budgetAggregate);
        budgetAggregateRepository.save.mockResolvedValue(undefined);

        const result = await useCase.execute(input);

        expect(result).toBeUndefined();
      });
    });

    describe('Edge Cases and Input Validation', () => {
      it('should handle negative amounts', async () => {
        const budgetEntity = BudgetEntity.create({
          name: 'Negative Amount Budget',
          amount: new CurrencyVO(1000, Currency.VND),
          userId: 'user-negative',
          category: BudgetCategory.FLEXIBLE,
          color: '#555666',
          icon: 'negative',
          month: 12,
          year: 2024,
          archivedAt: null,
          createdAt: mockDate,
          updatedAt: mockDate,
        });

        const budgetAggregate = BudgetAggregate.create({
          budget: budgetEntity,
          spending: new TransactionsWatchList([]),
        });

        const spendSpy = jest.spyOn(budgetAggregate, 'spend');

        const input = {
          budgetId: 'budget-negative',
          userId: 'user-negative',
          amount: -50,
          name: 'Negative Amount Spending',
        };

        budgetAggregateRepository.findById.mockResolvedValue(budgetAggregate);
        budgetAggregateRepository.save.mockResolvedValue(undefined);

        await useCase.execute(input);

        expect(spendSpy.mock.calls[0][0].amount.value).toBe(-50);
      });

      it('should handle decimal amounts', async () => {
        const budgetEntity = BudgetEntity.create({
          name: 'Decimal Amount Budget',
          amount: new CurrencyVO(1000, Currency.EUR),
          userId: 'user-decimal',
          category: BudgetCategory.FIXED,
          color: '#777888',
          icon: 'decimal',
          month: 1,
          year: 2025,
          archivedAt: null,
          createdAt: mockDate,
          updatedAt: mockDate,
        });

        const budgetAggregate = BudgetAggregate.create({
          budget: budgetEntity,
          spending: new TransactionsWatchList([]),
        });

        const spendSpy = jest.spyOn(budgetAggregate, 'spend');

        const input = {
          budgetId: 'budget-decimal',
          userId: 'user-decimal',
          amount: 12.99,
          name: 'Decimal Amount Spending',
        };

        budgetAggregateRepository.findById.mockResolvedValue(budgetAggregate);
        budgetAggregateRepository.save.mockResolvedValue(undefined);

        await useCase.execute(input);

        expect(spendSpy.mock.calls[0][0].amount.value).toBe(12.99);
      });

      it('should handle special characters in name and description', async () => {
        const budgetEntity = BudgetEntity.create({
          name: 'Special Characters Budget',
          amount: new CurrencyVO(1000, Currency.USD),
          userId: 'user-special',
          category: BudgetCategory.FLEXIBLE,
          color: '#999AAA',
          icon: 'special',
          month: 2,
          year: 2025,
          archivedAt: null,
          createdAt: mockDate,
          updatedAt: mockDate,
        });

        const budgetAggregate = BudgetAggregate.create({
          budget: budgetEntity,
          spending: new TransactionsWatchList([]),
        });

        const spendSpy = jest.spyOn(budgetAggregate, 'spend');

        const input = {
          budgetId: 'budget-special',
          userId: 'user-special',
          amount: 25,
          name: 'Café & Restaurant 🍕',
          description: 'Dinner at "John\'s Place" (20% tip included)',
        };

        budgetAggregateRepository.findById.mockResolvedValue(budgetAggregate);
        budgetAggregateRepository.save.mockResolvedValue(undefined);

        await useCase.execute(input);

        expect(spendSpy.mock.calls[0][0].name).toBe('Café & Restaurant 🍕');
        expect(spendSpy.mock.calls[0][0].description).toBe(
          'Dinner at "John\'s Place" (20% tip included)',
        );
      });
    });
  });
});
