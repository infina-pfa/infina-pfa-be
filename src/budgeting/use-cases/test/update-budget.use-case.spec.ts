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
import { UpdateBudgetUseCase } from '../update-budget.use-case';

describe('UpdateBudgetUseCase', () => {
  let useCase: UpdateBudgetUseCase;
  let budgetAggregateRepository: jest.Mocked<BudgetAggregateRepository>;

  const mockDate = new Date('2024-01-01T00:00:00Z');
  const updateDate = new Date('2024-01-02T00:00:00Z');

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
        UpdateBudgetUseCase,
        {
          provide: BudgetAggregateRepository,
          useValue: mockBudgetAggregateRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdateBudgetUseCase>(UpdateBudgetUseCase);
    budgetAggregateRepository = module.get(BudgetAggregateRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    describe('Happy Path', () => {
      it('should update budget name successfully', async () => {
        const budgetEntity = BudgetEntity.create({
          name: 'Original Food Budget',
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
          spending: { items: [] } as any,
        });

        const input = {
          id: 'budget-123',
          props: {
            name: 'Updated Food Budget',
            userId: 'user-123',
          },
        };

        budgetAggregateRepository.findById.mockResolvedValue(budgetAggregate);
        budgetAggregateRepository.save.mockResolvedValue(undefined);

        jest.setSystemTime(updateDate);

        const result = await useCase.execute(input);

        expect(budgetAggregateRepository.findById).toHaveBeenCalledWith(
          'budget-123',
        );
        expect(budgetAggregateRepository.save).toHaveBeenCalledWith(
          budgetAggregate,
        );
        expect(result.budget.name).toBe('Updated Food Budget');
        expect(result.budget.props.updatedAt).toEqual(updateDate);
      });

      it('should update budget category successfully', async () => {
        const budgetEntity = BudgetEntity.create({
          name: 'Transport Budget',
          amount: new CurrencyVO(500, Currency.VND),
          userId: 'user-456',
          category: BudgetCategory.FLEXIBLE,
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
          spending: { items: [] } as any,
        });

        const input = {
          id: 'budget-456',
          props: {
            category: BudgetCategory.FIXED,
            userId: 'user-456',
          },
        };

        budgetAggregateRepository.findById.mockResolvedValue(budgetAggregate);
        budgetAggregateRepository.save.mockResolvedValue(undefined);

        const result = await useCase.execute(input);

        expect(result.budget.props.category).toBe(BudgetCategory.FIXED);
        expect(result.budget.name).toBe('Transport Budget'); // Unchanged
      });

      it('should update budget color and icon successfully', async () => {
        const budgetEntity = BudgetEntity.create({
          name: 'Entertainment Budget',
          amount: new CurrencyVO(300, Currency.EUR),
          userId: 'user-789',
          category: BudgetCategory.FLEXIBLE,
          color: '#5733FF',
          icon: 'entertainment',
          month: 3,
          year: 2024,
          archivedAt: null,
          createdAt: mockDate,
          updatedAt: mockDate,
        });

        const budgetAggregate = BudgetAggregate.create({
          budget: budgetEntity,
          spending: { items: [] } as any,
        });

        const input = {
          id: 'budget-789',
          props: {
            color: '#FFFFFF',
            icon: 'new-entertainment',
            userId: 'user-789',
          },
        };

        budgetAggregateRepository.findById.mockResolvedValue(budgetAggregate);
        budgetAggregateRepository.save.mockResolvedValue(undefined);

        const result = await useCase.execute(input);

        expect(result.budget.props.color).toBe('#FFFFFF');
        expect(result.budget.props.icon).toBe('new-entertainment');
        expect(result.budget.props.category).toBe(BudgetCategory.FLEXIBLE); // Unchanged
      });

      it('should update budget month and year successfully', async () => {
        const budgetEntity = BudgetEntity.create({
          name: 'Bills Budget',
          amount: new CurrencyVO(800, Currency.USD),
          userId: 'user-bills',
          category: BudgetCategory.FIXED,
          color: '#123456',
          icon: 'bills',
          month: 4,
          year: 2024,
          archivedAt: null,
          createdAt: mockDate,
          updatedAt: mockDate,
        });

        const budgetAggregate = BudgetAggregate.create({
          budget: budgetEntity,
          spending: { items: [] } as any,
        });

        const input = {
          id: 'budget-bills',
          props: {
            month: 5,
            year: 2024,
            userId: 'user-bills',
          },
        };

        budgetAggregateRepository.findById.mockResolvedValue(budgetAggregate);
        budgetAggregateRepository.save.mockResolvedValue(undefined);

        const result = await useCase.execute(input);

        expect(result.budget.props.month).toBe(5);
        expect(result.budget.props.year).toBe(2024);
      });

      it('should update multiple properties simultaneously', async () => {
        const budgetEntity = BudgetEntity.create({
          name: 'Multi Update Budget',
          amount: new CurrencyVO(1200, Currency.VND),
          userId: 'user-multi',
          category: BudgetCategory.FLEXIBLE,
          color: '#789ABC',
          icon: 'multi',
          month: 6,
          year: 2024,
          archivedAt: null,
          createdAt: mockDate,
          updatedAt: mockDate,
        });

        const budgetAggregate = BudgetAggregate.create({
          budget: budgetEntity,
          spending: { items: [] } as any,
        });

        const input = {
          id: 'budget-multi',
          props: {
            name: 'Updated Multi Budget',
            category: BudgetCategory.FIXED,
            color: '#ABCDEF',
            icon: 'updated-multi',
            month: 7,
            year: 2024,
            userId: 'user-multi',
          },
        };

        budgetAggregateRepository.findById.mockResolvedValue(budgetAggregate);
        budgetAggregateRepository.save.mockResolvedValue(undefined);

        const result = await useCase.execute(input);

        expect(result.budget.name).toBe('Updated Multi Budget');
        expect(result.budget.props.category).toBe(BudgetCategory.FIXED);
        expect(result.budget.props.color).toBe('#ABCDEF');
        expect(result.budget.props.icon).toBe('updated-multi');
        expect(result.budget.props.month).toBe(7);
        expect(result.budget.props.year).toBe(2024);
      });

      it('should handle partial updates leaving other properties unchanged', async () => {
        const budgetEntity = BudgetEntity.create({
          name: 'Partial Update Budget',
          amount: new CurrencyVO(900, Currency.EUR),
          userId: 'user-partial',
          category: BudgetCategory.FLEXIBLE,
          color: '#FEDCBA',
          icon: 'partial',
          month: 8,
          year: 2024,
          archivedAt: null,
          createdAt: mockDate,
          updatedAt: mockDate,
        });

        const budgetAggregate = BudgetAggregate.create({
          budget: budgetEntity,
          spending: { items: [] } as any,
        });

        const input = {
          id: 'budget-partial',
          props: {
            name: 'Updated Partial Budget',
            userId: 'user-partial',
          },
        };

        budgetAggregateRepository.findById.mockResolvedValue(budgetAggregate);
        budgetAggregateRepository.save.mockResolvedValue(undefined);

        const result = await useCase.execute(input);

        expect(result.budget.name).toBe('Updated Partial Budget');
        expect(result.budget.props.category).toBe(BudgetCategory.FLEXIBLE);
        expect(result.budget.props.color).toBe('#FEDCBA');
        expect(result.budget.props.icon).toBe('partial');
        expect(result.budget.props.month).toBe(8);
        expect(result.budget.props.year).toBe(2024);
      });
    });

    describe('Error Cases', () => {
      it('should throw BudgetErrorFactory.budgetNotFound when budget does not exist', async () => {
        const input = {
          id: 'non-existent-budget',
          props: {
            name: 'Updated Name',
            userId: 'user-123',
          },
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

      it('should throw BudgetErrorFactory.budgetNotFound when budget belongs to different user', async () => {
        const budgetEntity = BudgetEntity.create({
          name: 'Other User Budget',
          amount: new CurrencyVO(1000, Currency.USD),
          userId: 'other-user',
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
          spending: { items: [] } as any,
        });

        const input = {
          id: 'budget-123',
          props: {
            name: 'Updated Name',
            userId: 'current-user',
          },
        };

        budgetAggregateRepository.findById.mockResolvedValue(budgetAggregate);

        await expect(useCase.execute(input)).rejects.toThrow(
          BudgetErrorFactory.budgetNotFound(),
        );

        expect(budgetAggregateRepository.findById).toHaveBeenCalledWith(
          'budget-123',
        );
        expect(budgetAggregateRepository.save).not.toHaveBeenCalled();
      });

      it('should throw BudgetErrorFactory.budgetNotFound when budget is archived', async () => {
        const archivedDate = new Date('2024-01-15T00:00:00Z');
        const budgetEntity = BudgetEntity.create({
          name: 'Archived Budget',
          amount: new CurrencyVO(1000, Currency.USD),
          userId: 'user-archived',
          category: BudgetCategory.FLEXIBLE,
          color: '#FF5733',
          icon: 'food',
          month: 1,
          year: 2024,
          archivedAt: archivedDate,
          createdAt: mockDate,
          updatedAt: mockDate,
        });

        const budgetAggregate = BudgetAggregate.create({
          budget: budgetEntity,
          spending: { items: [] } as any,
        });

        const input = {
          id: 'budget-archived',
          props: {
            name: 'Updated Name',
            userId: 'user-archived',
          },
        };

        budgetAggregateRepository.findById.mockResolvedValue(budgetAggregate);

        await expect(useCase.execute(input)).rejects.toThrow(
          BudgetErrorFactory.budgetNotFound(),
        );

        expect(budgetAggregateRepository.findById).toHaveBeenCalledWith(
          'budget-archived',
        );
        expect(budgetAggregateRepository.save).not.toHaveBeenCalled();
      });

      it('should propagate repository findById errors', async () => {
        const input = {
          id: 'budget-error',
          props: {
            name: 'Updated Name',
            userId: 'user-error',
          },
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
          icon: 'food',
          month: 1,
          year: 2024,
          archivedAt: null,
          createdAt: mockDate,
          updatedAt: mockDate,
        });

        const budgetAggregate = BudgetAggregate.create({
          budget: budgetEntity,
          spending: { items: [] } as any,
        });

        const input = {
          id: 'budget-save-error',
          props: {
            name: 'Updated Name',
            userId: 'user-save-error',
          },
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
          amount: new CurrencyVO(1100, Currency.EUR),
          userId: 'user-integration',
          category: BudgetCategory.FIXED,
          color: '#ABCDEF',
          icon: 'integration',
          month: 9,
          year: 2024,
          archivedAt: null,
          createdAt: mockDate,
          updatedAt: mockDate,
        });

        const budgetAggregate = BudgetAggregate.create({
          budget: budgetEntity,
          spending: { items: [] } as any,
        });

        const input = {
          id: 'budget-integration',
          props: {
            name: 'Updated Integration Budget',
            userId: 'user-integration',
          },
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

      it('should pass updated budget aggregate to save method', async () => {
        const budgetEntity = BudgetEntity.create({
          name: 'Aggregate Test Budget',
          amount: new CurrencyVO(1200, Currency.VND),
          userId: 'user-aggregate',
          category: BudgetCategory.FLEXIBLE,
          color: '#123456',
          icon: 'aggregate',
          month: 10,
          year: 2024,
          archivedAt: null,
          createdAt: mockDate,
          updatedAt: mockDate,
        });

        const budgetAggregate = BudgetAggregate.create({
          budget: budgetEntity,
          spending: { items: [] } as any,
        });

        const input = {
          id: 'budget-aggregate',
          props: {
            name: 'Updated Aggregate Budget',
            color: '#FEDCBA',
            userId: 'user-aggregate',
          },
        };

        budgetAggregateRepository.findById.mockResolvedValue(budgetAggregate);
        budgetAggregateRepository.save.mockResolvedValue(undefined);

        const result = await useCase.execute(input);

        expect(budgetAggregateRepository.save).toHaveBeenCalledWith(result);
        expect(budgetAggregateRepository.save.mock.calls[0][0]).toBeInstanceOf(
          BudgetAggregate,
        );
        expect(
          budgetAggregateRepository.save.mock.calls[0][0].budget.name,
        ).toBe('Updated Aggregate Budget');
      });

      it('should return the updated budget aggregate', async () => {
        const budgetEntity = BudgetEntity.create({
          name: 'Return Test Budget',
          amount: new CurrencyVO(1300, Currency.USD),
          userId: 'user-return',
          category: BudgetCategory.FIXED,
          color: '#789ABC',
          icon: 'return',
          month: 11,
          year: 2024,
          archivedAt: null,
          createdAt: mockDate,
          updatedAt: mockDate,
        });

        const budgetAggregate = BudgetAggregate.create({
          budget: budgetEntity,
          spending: { items: [] } as any,
        });

        const input = {
          id: 'budget-return',
          props: {
            name: 'Updated Return Budget',
            userId: 'user-return',
          },
        };

        budgetAggregateRepository.findById.mockResolvedValue(budgetAggregate);
        budgetAggregateRepository.save.mockResolvedValue(undefined);

        const result = await useCase.execute(input);

        expect(result).toBe(budgetAggregate);
        expect(result.budget.name).toBe('Updated Return Budget');
      });
    });

    describe('Edge Cases and Input Validation', () => {
      it('should handle empty string updates', async () => {
        const budgetEntity = BudgetEntity.create({
          name: 'Empty String Test Budget',
          amount: new CurrencyVO(1400, Currency.EUR),
          userId: 'user-empty',
          category: BudgetCategory.FLEXIBLE,
          color: '#ABCABC',
          icon: 'empty',
          month: 12,
          year: 2024,
          archivedAt: null,
          createdAt: mockDate,
          updatedAt: mockDate,
        });

        const budgetAggregate = BudgetAggregate.create({
          budget: budgetEntity,
          spending: { items: [] } as any,
        });

        const input = {
          id: 'budget-empty',
          props: {
            name: '',
            icon: '',
            userId: 'user-empty',
          },
        };

        budgetAggregateRepository.findById.mockResolvedValue(budgetAggregate);
        budgetAggregateRepository.save.mockResolvedValue(undefined);

        const result = await useCase.execute(input);

        expect(result.budget.name).toBe('');
        expect(result.budget.props.icon).toBe('');
      });

      it('should handle empty props object', async () => {
        const budgetEntity = BudgetEntity.create({
          name: 'No Props Update Budget',
          amount: new CurrencyVO(1500, Currency.VND),
          userId: 'user-no-props',
          category: BudgetCategory.FIXED,
          color: '#111111',
          icon: 'no-props',
          month: 1,
          year: 2025,
          archivedAt: null,
          createdAt: mockDate,
          updatedAt: mockDate,
        });

        const budgetAggregate = BudgetAggregate.create({
          budget: budgetEntity,
          spending: { items: [] } as any,
        });

        const input = {
          id: 'budget-no-props',
          props: {
            userId: 'user-no-props',
          },
        };

        budgetAggregateRepository.findById.mockResolvedValue(budgetAggregate);
        budgetAggregateRepository.save.mockResolvedValue(undefined);

        const result = await useCase.execute(input);

        expect(result.budget.name).toBe('No Props Update Budget');
        expect(result.budget.props.category).toBe(BudgetCategory.FIXED);
        expect(result.budget.props.color).toBe('#111111');
        expect(result.budget.props.icon).toBe('no-props');
      });

      it('should maintain immutability of userId and amount in budget entity', async () => {
        const budgetEntity = BudgetEntity.create({
          name: 'Immutability Test Budget',
          amount: new CurrencyVO(1600, Currency.USD),
          userId: 'original-user-id',
          category: BudgetCategory.FLEXIBLE,
          color: '#222222',
          icon: 'immutable',
          month: 2,
          year: 2025,
          archivedAt: null,
          createdAt: mockDate,
          updatedAt: mockDate,
        });

        const budgetAggregate = BudgetAggregate.create({
          budget: budgetEntity,
          spending: { items: [] } as any,
        });

        const input = {
          id: 'budget-immutable',
          props: {
            name: 'Updated Immutable Budget',
            color: '#CHANGED',
            userId: 'original-user-id',
          },
        };

        budgetAggregateRepository.findById.mockResolvedValue(budgetAggregate);
        budgetAggregateRepository.save.mockResolvedValue(undefined);

        const result = await useCase.execute(input);

        expect(result.userId).toBe('original-user-id');
        expect(result.budget.amount.value).toBe(1600);
        expect(result.budget.amount.currency).toBe(Currency.USD);
        expect(result.budget.props.createdAt).toEqual(mockDate);
      });
    });
  });
});
