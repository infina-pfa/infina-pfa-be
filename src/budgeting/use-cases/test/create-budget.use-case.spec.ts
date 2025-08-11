import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { Currency } from '@/common/types/user';
import { CurrencyVO } from '@/common/base';
import { BudgetCategory } from '../../domain/entities/budget.entity';
import { BudgetAggregate } from '../../domain/entities/budget.aggregate';
import { BudgetAggregateRepository } from '../../domain/repositories/budget-aggregate.repository';
import {
  CreateBudgetUseCase,
  CreateBudgetUseCaseInput,
} from '../create-budget.use-case';
import { BudgetErrorFactory } from '@/budgeting/domain/errors/budget-error.factory';

describe('CreateBudgetUseCase', () => {
  let useCase: CreateBudgetUseCase;
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
      findOne: jest.fn(),
      save: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateBudgetUseCase,
        {
          provide: BudgetAggregateRepository,
          useValue: mockBudgetAggregateRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateBudgetUseCase>(CreateBudgetUseCase);
    budgetAggregateRepository = module.get(BudgetAggregateRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    describe('Happy Path', () => {
      it('should create budget aggregate when valid input provided', async () => {
        const input: CreateBudgetUseCaseInput = {
          amount: 1000,
          category: BudgetCategory.FLEXIBLE,
          color: '#FF5733',
          icon: 'food',
          month: 1,
          userId: 'user-123',
          year: 2024,
          name: 'Food Budget',
        };

        budgetAggregateRepository.findOne.mockResolvedValue(null);
        budgetAggregateRepository.save.mockResolvedValue(undefined);

        const result = await useCase.execute(input);

        expect(budgetAggregateRepository.findOne).toHaveBeenCalledWith({
          name: 'Food Budget',
          userId: 'user-123',
          month: 1,
          year: 2024,
        });
        expect(budgetAggregateRepository.save).toHaveBeenCalledTimes(1);
        expect(result).toBeInstanceOf(BudgetAggregate);
        expect(result.budget.name).toBe('Food Budget');
        expect(result.budget.amount.value).toBe(1000);
        expect(result.budget.amount.currency).toBe(Currency.VND);
        expect(result.budget.props.category).toBe(BudgetCategory.FLEXIBLE);
        expect(result.budget.props.color).toBe('#FF5733');
        expect(result.budget.props.icon).toBe('food');
        expect(result.budget.props.month).toBe(1);
        expect(result.budget.props.year).toBe(2024);
        expect(result.userId).toBe('user-123');
      });

      it('should create budget with different categories', async () => {
        const testCases = [BudgetCategory.FIXED, BudgetCategory.FLEXIBLE];

        for (const category of testCases) {
          const input: CreateBudgetUseCaseInput = {
            amount: 800,
            category,
            color: '#33FF57',
            icon: 'test',
            month: 2,
            userId: 'user-category',
            year: 2024,
            name: `${category} Budget`,
          };

          budgetAggregateRepository.findOne.mockResolvedValue(null);
          budgetAggregateRepository.save.mockResolvedValue(undefined);

          const result = await useCase.execute(input);

          expect(result.budget.props.category).toBe(category);
          expect(result.budget.name).toBe(`${category} Budget`);

          jest.clearAllMocks();
        }
      });

      it('should create budget with different amounts', async () => {
        const testCases = [100, 500, 1000, 5000, 10000];

        for (const amount of testCases) {
          const input: CreateBudgetUseCaseInput = {
            amount,
            category: BudgetCategory.FLEXIBLE,
            color: '#5733FF',
            icon: 'amount-test',
            month: 3,
            userId: 'user-amount',
            year: 2024,
            name: `${amount} Budget`,
          };

          budgetAggregateRepository.findOne.mockResolvedValue(null);
          budgetAggregateRepository.save.mockResolvedValue(undefined);

          const result = await useCase.execute(input);

          expect(result.budget.amount.value).toBe(amount);
          expect(result.budget.name).toBe(`${amount} Budget`);

          jest.clearAllMocks();
        }
      });

      it('should create budget for different months and years', async () => {
        const testCases = [
          { month: 1, year: 2024 },
          { month: 6, year: 2024 },
          { month: 12, year: 2024 },
          { month: 1, year: 2025 },
        ];

        for (const { month, year } of testCases) {
          const input: CreateBudgetUseCaseInput = {
            amount: 1200,
            category: BudgetCategory.FIXED,
            color: '#FF3357',
            icon: 'date-test',
            month,
            userId: 'user-date',
            year,
            name: `Budget ${month}/${year}`,
          };

          budgetAggregateRepository.findOne.mockResolvedValue(null);
          budgetAggregateRepository.save.mockResolvedValue(undefined);

          const result = await useCase.execute(input);

          expect(result.budget.props.month).toBe(month);
          expect(result.budget.props.year).toBe(year);
          expect(result.budget.name).toBe(`Budget ${month}/${year}`);

          jest.clearAllMocks();
        }
      });

      it('should create budget aggregate with empty spending list', async () => {
        const input: CreateBudgetUseCaseInput = {
          amount: 1500,
          category: BudgetCategory.FLEXIBLE,
          color: '#123456',
          icon: 'empty-spending',
          month: 4,
          userId: 'user-empty-spending',
          year: 2024,
          name: 'Empty Spending Budget',
        };

        budgetAggregateRepository.findOne.mockResolvedValue(null);
        budgetAggregateRepository.save.mockResolvedValue(undefined);

        const result = await useCase.execute(input);

        expect(result.spending).toEqual([]);
        expect(result.spent.value).toBe(0);
        expect(result.totalBudget.value).toBe(1500);
        expect(result.remainingBudget.value).toBe(1500);
      });

      it('should handle different color formats', async () => {
        const testCases = ['#FF5733', '#FFFFFF', '#000000', '#A1B2C3'];

        for (const color of testCases) {
          const input: CreateBudgetUseCaseInput = {
            amount: 600,
            category: BudgetCategory.FLEXIBLE,
            color,
            icon: 'color-test',
            month: 5,
            userId: 'user-color',
            year: 2024,
            name: `${color} Budget`,
          };

          budgetAggregateRepository.findOne.mockResolvedValue(null);
          budgetAggregateRepository.save.mockResolvedValue(undefined);

          const result = await useCase.execute(input);

          expect(result.budget.props.color).toBe(color);

          jest.clearAllMocks();
        }
      });

      it('should handle different icon values', async () => {
        const testCases = [
          'food',
          'transport',
          'entertainment',
          'shopping',
          'bills',
        ];

        for (const icon of testCases) {
          const input: CreateBudgetUseCaseInput = {
            amount: 700,
            category: BudgetCategory.FIXED,
            color: '#789ABC',
            icon,
            month: 6,
            userId: 'user-icon',
            year: 2024,
            name: `${icon} Budget`,
          };

          budgetAggregateRepository.findOne.mockResolvedValue(null);
          budgetAggregateRepository.save.mockResolvedValue(undefined);

          const result = await useCase.execute(input);

          expect(result.budget.props.icon).toBe(icon);

          jest.clearAllMocks();
        }
      });
    });

    describe('Business Logic Validation', () => {
      it('should throw ConflictException when budget with same name exists for same month/year', async () => {
        const input: CreateBudgetUseCaseInput = {
          amount: 1000,
          category: BudgetCategory.FLEXIBLE,
          color: '#FF5733',
          icon: 'food',
          month: 7,
          userId: 'user-conflict',
          year: 2024,
          name: 'Existing Budget',
        };

        const existingBudgetAggregate = BudgetAggregate.create({
          budget: {
            name: 'Existing Budget',
            amount: new CurrencyVO(800),
            userId: 'user-conflict',
            category: BudgetCategory.FIXED,
            color: '#000000',
            icon: 'existing',
            month: 7,
            year: 2024,
            deletedAt: null,
            createdAt: mockDate,
            updatedAt: mockDate,
          } as any,
          spending: { items: [] } as any,
        });

        budgetAggregateRepository.findOne.mockResolvedValue(
          existingBudgetAggregate,
        );

        await expect(useCase.execute(input)).rejects.toThrow(ConflictException);
        await expect(useCase.execute(input)).rejects.toThrow(
          BudgetErrorFactory.budgetAlreadyExists(),
        );

        expect(budgetAggregateRepository.findOne).toHaveBeenCalledWith({
          name: 'Existing Budget',
          userId: 'user-conflict',
          month: 7,
          year: 2024,
        });
        expect(budgetAggregateRepository.save).not.toHaveBeenCalled();
      });

      it('should allow creating budget with same name for different month', async () => {
        const input: CreateBudgetUseCaseInput = {
          amount: 1000,
          category: BudgetCategory.FLEXIBLE,
          color: '#FF5733',
          icon: 'food',
          month: 8,
          userId: 'user-different-month',
          year: 2024,
          name: 'Same Name Budget',
        };

        budgetAggregateRepository.findOne.mockResolvedValue(null);
        budgetAggregateRepository.save.mockResolvedValue(undefined);

        const result = await useCase.execute(input);

        expect(budgetAggregateRepository.findOne).toHaveBeenCalledWith({
          name: 'Same Name Budget',
          userId: 'user-different-month',
          month: 8,
          year: 2024,
        });
        expect(result.budget.name).toBe('Same Name Budget');
        expect(result.budget.props.month).toBe(8);
      });

      it('should allow creating budget with same name for different year', async () => {
        const input: CreateBudgetUseCaseInput = {
          amount: 1000,
          category: BudgetCategory.FLEXIBLE,
          color: '#FF5733',
          icon: 'food',
          month: 1,
          userId: 'user-different-year',
          year: 2025,
          name: 'Same Name Budget',
        };

        budgetAggregateRepository.findOne.mockResolvedValue(null);
        budgetAggregateRepository.save.mockResolvedValue(undefined);

        const result = await useCase.execute(input);

        expect(budgetAggregateRepository.findOne).toHaveBeenCalledWith({
          name: 'Same Name Budget',
          userId: 'user-different-year',
          month: 1,
          year: 2025,
        });
        expect(result.budget.name).toBe('Same Name Budget');
        expect(result.budget.props.year).toBe(2025);
      });

      it('should allow creating budget with same name for different user', async () => {
        const input: CreateBudgetUseCaseInput = {
          amount: 1000,
          category: BudgetCategory.FLEXIBLE,
          color: '#FF5733',
          icon: 'food',
          month: 1,
          userId: 'different-user',
          year: 2024,
          name: 'Same Name Budget',
        };

        budgetAggregateRepository.findOne.mockResolvedValue(null);
        budgetAggregateRepository.save.mockResolvedValue(undefined);

        const result = await useCase.execute(input);

        expect(budgetAggregateRepository.findOne).toHaveBeenCalledWith({
          name: 'Same Name Budget',
          userId: 'different-user',
          month: 1,
          year: 2024,
        });
        expect(result.userId).toBe('different-user');
        expect(result.budget.name).toBe('Same Name Budget');
      });
    });

    describe('Repository Integration', () => {
      it('should call repository methods in correct order', async () => {
        const input: CreateBudgetUseCaseInput = {
          amount: 1100,
          category: BudgetCategory.FIXED,
          color: '#ABCDEF',
          icon: 'integration',
          month: 9,
          userId: 'user-integration',
          year: 2024,
          name: 'Integration Test Budget',
        };

        budgetAggregateRepository.findOne.mockResolvedValue(null);
        budgetAggregateRepository.save.mockResolvedValue(undefined);

        await useCase.execute(input);

        expect(budgetAggregateRepository.findOne).toHaveBeenCalledWith({
          name: 'Integration Test Budget',
          userId: 'user-integration',
          month: 9,
          year: 2024,
        });
        expect(budgetAggregateRepository.save).toHaveBeenCalledTimes(1);
      });

      it('should pass correct budget aggregate to save method', async () => {
        const input: CreateBudgetUseCaseInput = {
          amount: 1300,
          category: BudgetCategory.FLEXIBLE,
          color: '#FEDCBA',
          icon: 'save-test',
          month: 10,
          userId: 'user-save-test',
          year: 2024,
          name: 'Save Test Budget',
        };

        budgetAggregateRepository.findOne.mockResolvedValue(null);
        budgetAggregateRepository.save.mockResolvedValue(undefined);

        const result = await useCase.execute(input);

        expect(budgetAggregateRepository.save).toHaveBeenCalledWith(result);
        expect(budgetAggregateRepository.save.mock.calls[0][0]).toBeInstanceOf(
          BudgetAggregate,
        );
      });

      it('should propagate repository findOne errors', async () => {
        const input: CreateBudgetUseCaseInput = {
          amount: 1400,
          category: BudgetCategory.FIXED,
          color: '#123321',
          icon: 'error-test',
          month: 11,
          userId: 'user-error',
          year: 2024,
          name: 'Error Test Budget',
        };

        const repositoryError = new Error('Database connection failed');
        budgetAggregateRepository.findOne.mockRejectedValue(repositoryError);

        await expect(useCase.execute(input)).rejects.toThrow(
          'Database connection failed',
        );
        expect(budgetAggregateRepository.save).not.toHaveBeenCalled();
      });

      it('should propagate repository save errors', async () => {
        const input: CreateBudgetUseCaseInput = {
          amount: 1500,
          category: BudgetCategory.FLEXIBLE,
          color: '#456654',
          icon: 'save-error',
          month: 12,
          userId: 'user-save-error',
          year: 2024,
          name: 'Save Error Budget',
        };

        const saveError = new Error('Database save failed');
        budgetAggregateRepository.findOne.mockResolvedValue(null);
        budgetAggregateRepository.save.mockRejectedValue(saveError);

        await expect(useCase.execute(input)).rejects.toThrow(
          'Database save failed',
        );
        expect(budgetAggregateRepository.findOne).toHaveBeenCalledTimes(1);
        expect(budgetAggregateRepository.save).toHaveBeenCalledTimes(1);
      });
    });

    describe('Edge Cases and Input Validation', () => {
      it('should handle empty string name gracefully', async () => {
        const input: CreateBudgetUseCaseInput = {
          amount: 1600,
          category: BudgetCategory.FLEXIBLE,
          color: '#789987',
          icon: 'empty-name',
          month: 1,
          userId: 'user-empty-name',
          year: 2024,
          name: '',
        };

        budgetAggregateRepository.findOne.mockResolvedValue(null);
        budgetAggregateRepository.save.mockResolvedValue(undefined);

        const result = await useCase.execute(input);

        expect(result.budget.name).toBe('');
        expect(budgetAggregateRepository.findOne).toHaveBeenCalledWith({
          name: '',
          userId: 'user-empty-name',
          month: 1,
          year: 2024,
        });
      });

      it('should handle very large amounts', async () => {
        const input: CreateBudgetUseCaseInput = {
          amount: 999999999,
          category: BudgetCategory.FIXED,
          color: '#ABCABC',
          icon: 'large-amount',
          month: 2,
          userId: 'user-large-amount',
          year: 2024,
          name: 'Large Amount Budget',
        };

        budgetAggregateRepository.findOne.mockResolvedValue(null);
        budgetAggregateRepository.save.mockResolvedValue(undefined);

        const result = await useCase.execute(input);

        expect(result.budget.amount.value).toBe(999999999);
      });

      it('should handle small positive amounts', async () => {
        const input: CreateBudgetUseCaseInput = {
          amount: 1,
          category: BudgetCategory.FLEXIBLE,
          color: '#111222',
          icon: 'small-amount',
          month: 3,
          userId: 'user-small-amount',
          year: 2024,
          name: 'Small Amount Budget',
        };

        budgetAggregateRepository.findOne.mockResolvedValue(null);
        budgetAggregateRepository.save.mockResolvedValue(undefined);

        const result = await useCase.execute(input);

        expect(result.budget.amount.value).toBe(1);
      });

      it('should handle edge month values', async () => {
        const testCases = [1, 12];

        for (const month of testCases) {
          const input: CreateBudgetUseCaseInput = {
            amount: 1700,
            category: BudgetCategory.FIXED,
            color: '#333444',
            icon: 'edge-month',
            month,
            userId: 'user-edge-month',
            year: 2024,
            name: `Edge Month ${month} Budget`,
          };

          budgetAggregateRepository.findOne.mockResolvedValue(null);
          budgetAggregateRepository.save.mockResolvedValue(undefined);

          const result = await useCase.execute(input);

          expect(result.budget.props.month).toBe(month);

          jest.clearAllMocks();
        }
      });
    });
  });
});
