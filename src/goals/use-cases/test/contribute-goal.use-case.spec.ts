import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import {
  ContributeGoalUseCase,
  ContributeGoalUseCaseInput,
} from '../contribute-goal.use-case';
import {
  GoalAggregateRepository,
  GoalErrorFactory,
  GoalAggregate,
} from '@/goals/domain';
import { CurrencyVO } from '@/common/base';
import { Currency } from '@/common/types';
import { GoalEntity } from '@/goals/domain/entities/goal.entity';
import { GoalTransactionsWatchList } from '@/goals/domain/watch-list/goal-transactions.watch-list';

describe('ContributeGoalUseCase', () => {
  let useCase: ContributeGoalUseCase;
  let goalAggregateRepository: jest.Mocked<GoalAggregateRepository>;

  const mockUserId = 'user-123';
  const mockGoalId = 'goal-456';

  beforeEach(async () => {
    const goalAggregateRepositoryMock = {
      findById: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      findMany: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContributeGoalUseCase,
        {
          provide: GoalAggregateRepository,
          useValue: goalAggregateRepositoryMock,
        },
      ],
    }).compile();

    useCase = module.get<ContributeGoalUseCase>(ContributeGoalUseCase);
    goalAggregateRepository = module.get(GoalAggregateRepository);
  });

  const createMockGoalAggregate = (
    userId: string = mockUserId,
    targetAmount?: CurrencyVO,
    currency: Currency = Currency.USD,
  ): GoalAggregate => {
    const goalEntity = GoalEntity.create({
      userId,
      title: 'Test Goal',
      description: 'Test goal description',
      targetAmount,
      currentAmount: new CurrencyVO(0, currency),
      dueDate: new Date('2025-12-31'),
    });

    return GoalAggregate.create(
      {
        goal: goalEntity,
        transactions: new GoalTransactionsWatchList([]),
      },
      mockGoalId,
    );
  };

  describe('execute', () => {
    const validInput: ContributeGoalUseCaseInput = {
      goalId: mockGoalId,
      userId: mockUserId,
      amount: 100,
      name: 'Monthly contribution',
      description: 'Regular monthly savings',
      recurring: 30,
    };

    describe('successful contributions', () => {
      it('should contribute to goal with target amount successfully', async () => {
        // Arrange
        const targetAmount = new CurrencyVO(5000, Currency.USD);
        const mockGoalAggregate = createMockGoalAggregate(
          mockUserId,
          targetAmount,
        );
        const contributeSpy = jest.spyOn(mockGoalAggregate, 'contribute');

        goalAggregateRepository.findById.mockResolvedValue(mockGoalAggregate);
        goalAggregateRepository.save.mockResolvedValue(undefined);

        // Act
        const result = await useCase.execute(validInput);

        // Assert
        expect(goalAggregateRepository.findById).toHaveBeenCalledWith(
          mockGoalId,
        );
        expect(contributeSpy).toHaveBeenCalledWith({
          amount: new CurrencyVO(validInput.amount, Currency.USD),
          name: validInput.name,
          description: validInput.description,
          recurring: validInput.recurring,
        });
        expect(goalAggregateRepository.save).toHaveBeenCalledWith(
          mockGoalAggregate,
        );
        expect(result).toBe(mockGoalAggregate);
      });

      it('should contribute to goal without target amount using current amount currency', async () => {
        // Arrange
        const mockGoalAggregate = createMockGoalAggregate(
          mockUserId,
          undefined,
          Currency.EUR,
        );
        const contributeSpy = jest.spyOn(mockGoalAggregate, 'contribute');

        goalAggregateRepository.findById.mockResolvedValue(mockGoalAggregate);
        goalAggregateRepository.save.mockResolvedValue(undefined);

        // Act
        const result = await useCase.execute(validInput);

        // Assert
        expect(contributeSpy).toHaveBeenCalledWith({
          amount: new CurrencyVO(validInput.amount, Currency.EUR), // Uses current amount currency
          name: validInput.name,
          description: validInput.description,
          recurring: validInput.recurring,
        });
        expect(goalAggregateRepository.save).toHaveBeenCalledWith(
          mockGoalAggregate,
        );
        expect(result).toBe(mockGoalAggregate);
      });

      it('should contribute with minimal required fields', async () => {
        // Arrange
        const minimalInput: ContributeGoalUseCaseInput = {
          goalId: mockGoalId,
          userId: mockUserId,
          amount: 50,
        };

        const mockGoalAggregate = createMockGoalAggregate();
        const contributeSpy = jest.spyOn(mockGoalAggregate, 'contribute');

        goalAggregateRepository.findById.mockResolvedValue(mockGoalAggregate);
        goalAggregateRepository.save.mockResolvedValue(undefined);

        // Act
        const result = await useCase.execute(minimalInput);

        // Assert
        expect(contributeSpy).toHaveBeenCalledWith({
          amount: new CurrencyVO(minimalInput.amount, Currency.USD),
          name: undefined,
          description: undefined,
          recurring: undefined,
        });
        expect(goalAggregateRepository.save).toHaveBeenCalledWith(
          mockGoalAggregate,
        );
        expect(result).toBe(mockGoalAggregate);
      });

      it('should handle decimal amounts correctly', async () => {
        // Arrange
        const decimalInput = { ...validInput, amount: 123.45 };
        const mockGoalAggregate = createMockGoalAggregate();
        const contributeSpy = jest.spyOn(mockGoalAggregate, 'contribute');

        goalAggregateRepository.findById.mockResolvedValue(mockGoalAggregate);
        goalAggregateRepository.save.mockResolvedValue(undefined);

        // Act
        const result = await useCase.execute(decimalInput);

        // Assert
        expect(contributeSpy).toHaveBeenCalledWith({
          amount: new CurrencyVO(123.45, Currency.USD),
          name: decimalInput.name,
          description: decimalInput.description,
          recurring: decimalInput.recurring,
        });
        expect(result).toBe(mockGoalAggregate);
      });

      it('should handle very small amounts', async () => {
        // Arrange
        const smallAmountInput = { ...validInput, amount: 0.01 };
        const mockGoalAggregate = createMockGoalAggregate();
        const contributeSpy = jest.spyOn(mockGoalAggregate, 'contribute');

        goalAggregateRepository.findById.mockResolvedValue(mockGoalAggregate);
        goalAggregateRepository.save.mockResolvedValue(undefined);

        // Act
        const result = await useCase.execute(smallAmountInput);

        // Assert
        expect(contributeSpy).toHaveBeenCalledWith({
          amount: new CurrencyVO(0.01, Currency.USD),
          name: smallAmountInput.name,
          description: smallAmountInput.description,
          recurring: smallAmountInput.recurring,
        });
        expect(result).toBe(mockGoalAggregate);
      });

      it('should handle large amounts', async () => {
        // Arrange
        const largeAmountInput = { ...validInput, amount: 999999.99 };
        const mockGoalAggregate = createMockGoalAggregate();
        const contributeSpy = jest.spyOn(mockGoalAggregate, 'contribute');

        goalAggregateRepository.findById.mockResolvedValue(mockGoalAggregate);
        goalAggregateRepository.save.mockResolvedValue(undefined);

        // Act
        const result = await useCase.execute(largeAmountInput);

        // Assert
        expect(contributeSpy).toHaveBeenCalledWith({
          amount: new CurrencyVO(999999.99, Currency.USD),
          name: largeAmountInput.name,
          description: largeAmountInput.description,
          recurring: largeAmountInput.recurring,
        });
        expect(result).toBe(mockGoalAggregate);
      });

      it('should handle zero recurring value', async () => {
        // Arrange
        const zeroRecurringInput = { ...validInput, recurring: 0 };
        const mockGoalAggregate = createMockGoalAggregate();
        const contributeSpy = jest.spyOn(mockGoalAggregate, 'contribute');

        goalAggregateRepository.findById.mockResolvedValue(mockGoalAggregate);
        goalAggregateRepository.save.mockResolvedValue(undefined);

        // Act
        const result = await useCase.execute(zeroRecurringInput);

        // Assert
        expect(contributeSpy).toHaveBeenCalledWith({
          amount: new CurrencyVO(zeroRecurringInput.amount, Currency.USD),
          name: zeroRecurringInput.name,
          description: zeroRecurringInput.description,
          recurring: 0,
        });
        expect(result).toBe(mockGoalAggregate);
      });

      it('should handle different currencies correctly', async () => {
        // Arrange
        const mockGoalAggregate = createMockGoalAggregate(
          mockUserId,
          new CurrencyVO(10000, Currency.VND),
          Currency.VND,
        );
        const contributeSpy = jest.spyOn(mockGoalAggregate, 'contribute');

        goalAggregateRepository.findById.mockResolvedValue(mockGoalAggregate);
        goalAggregateRepository.save.mockResolvedValue(undefined);

        // Act
        const result = await useCase.execute(validInput);

        // Assert
        expect(contributeSpy).toHaveBeenCalledWith({
          amount: new CurrencyVO(validInput.amount, Currency.VND), // Uses goal's currency
          name: validInput.name,
          description: validInput.description,
          recurring: validInput.recurring,
        });
        expect(result).toBe(mockGoalAggregate);
      });
    });

    describe('error scenarios', () => {
      it('should throw NotFoundException when goal is not found', async () => {
        // Arrange
        goalAggregateRepository.findById.mockResolvedValue(null);

        // Act & Assert
        await expect(useCase.execute(validInput)).rejects.toThrow(
          GoalErrorFactory.goalNotFound(),
        );
        expect(goalAggregateRepository.save).not.toHaveBeenCalled();
      });

      it('should throw NotFoundException when user does not own the goal', async () => {
        // Arrange
        const mockGoalAggregate = createMockGoalAggregate('different-user-id');
        goalAggregateRepository.findById.mockResolvedValue(mockGoalAggregate);

        // Act & Assert
        await expect(useCase.execute(validInput)).rejects.toThrow(
          GoalErrorFactory.goalNotFound(), // For security, don't reveal goal exists
        );
        expect(goalAggregateRepository.save).not.toHaveBeenCalled();
      });

      it('should propagate domain validation errors from contribute method', async () => {
        // Arrange
        const mockGoalAggregate = createMockGoalAggregate();
        const domainError = new Error('Contribution amount must be positive');
        jest.spyOn(mockGoalAggregate, 'contribute').mockImplementation(() => {
          throw domainError;
        });

        goalAggregateRepository.findById.mockResolvedValue(mockGoalAggregate);

        // Act & Assert
        await expect(useCase.execute(validInput)).rejects.toThrow(domainError);
        expect(goalAggregateRepository.save).not.toHaveBeenCalled();
      });

      it('should handle repository findById error', async () => {
        // Arrange
        const repositoryError = new Error('Database connection failed');
        goalAggregateRepository.findById.mockRejectedValue(repositoryError);

        // Act & Assert
        await expect(useCase.execute(validInput)).rejects.toThrow(
          repositoryError,
        );
        expect(goalAggregateRepository.save).not.toHaveBeenCalled();
      });

      it('should handle repository save error', async () => {
        // Arrange
        const mockGoalAggregate = createMockGoalAggregate();
        const repositoryError = new Error('Database save failed');

        goalAggregateRepository.findById.mockResolvedValue(mockGoalAggregate);
        goalAggregateRepository.save.mockRejectedValue(repositoryError);

        // Act & Assert
        await expect(useCase.execute(validInput)).rejects.toThrow(
          repositoryError,
        );
        expect(goalAggregateRepository.findById).toHaveBeenCalledWith(
          mockGoalId,
        );
      });
    });

    describe('edge cases', () => {
      it('should handle empty string for optional fields', async () => {
        // Arrange
        const emptyStringInput = {
          ...validInput,
          name: '',
          description: '',
        };
        const mockGoalAggregate = createMockGoalAggregate();
        const contributeSpy = jest.spyOn(mockGoalAggregate, 'contribute');

        goalAggregateRepository.findById.mockResolvedValue(mockGoalAggregate);
        goalAggregateRepository.save.mockResolvedValue(undefined);

        // Act
        const result = await useCase.execute(emptyStringInput);

        // Assert
        expect(contributeSpy).toHaveBeenCalledWith({
          amount: new CurrencyVO(emptyStringInput.amount, Currency.USD),
          name: '',
          description: '',
          recurring: emptyStringInput.recurring,
        });
        expect(result).toBe(mockGoalAggregate);
      });

      it('should handle maximum safe integer amount', async () => {
        // Arrange
        const maxAmountInput = {
          ...validInput,
          amount: Number.MAX_SAFE_INTEGER,
        };
        const mockGoalAggregate = createMockGoalAggregate();
        const contributeSpy = jest.spyOn(mockGoalAggregate, 'contribute');

        goalAggregateRepository.findById.mockResolvedValue(mockGoalAggregate);
        goalAggregateRepository.save.mockResolvedValue(undefined);

        // Act
        const result = await useCase.execute(maxAmountInput);

        // Assert
        expect(contributeSpy).toHaveBeenCalledWith({
          amount: new CurrencyVO(Number.MAX_SAFE_INTEGER, Currency.USD),
          name: maxAmountInput.name,
          description: maxAmountInput.description,
          recurring: maxAmountInput.recurring,
        });
        expect(result).toBe(mockGoalAggregate);
      });

      it('should handle goal with both target and current amount in different currencies', async () => {
        // Arrange - This should not happen in practice, but test defensive behavior
        const goalEntity = GoalEntity.create({
          userId: mockUserId,
          title: 'Mixed Currency Goal',
          description: 'Test goal',
          targetAmount: new CurrencyVO(5000, Currency.EUR), // Target in EUR
          currentAmount: new CurrencyVO(0, Currency.USD), // Current in USD
          dueDate: new Date('2025-12-31'),
        });

        const mockGoalAggregate = GoalAggregate.create(
          {
            goal: goalEntity,
            transactions: new GoalTransactionsWatchList([]),
          },
          mockGoalId,
        );

        const contributeSpy = jest.spyOn(mockGoalAggregate, 'contribute');

        goalAggregateRepository.findById.mockResolvedValue(mockGoalAggregate);
        goalAggregateRepository.save.mockResolvedValue(undefined);

        // Act
        const result = await useCase.execute(validInput);

        // Assert - Should prioritize target amount currency
        expect(contributeSpy).toHaveBeenCalledWith({
          amount: new CurrencyVO(validInput.amount, Currency.EUR), // Uses target amount currency
          name: validInput.name,
          description: validInput.description,
          recurring: validInput.recurring,
        });
        expect(result).toBe(mockGoalAggregate);
      });
    });

    describe('method call verification', () => {
      it('should call repository methods in correct order', async () => {
        // Arrange
        const mockGoalAggregate = createMockGoalAggregate();
        goalAggregateRepository.findById.mockResolvedValue(mockGoalAggregate);
        goalAggregateRepository.save.mockResolvedValue(undefined);

        // Act
        await useCase.execute(validInput);

        // Assert
        expect(goalAggregateRepository.findById).toHaveBeenCalledTimes(1);
        expect(goalAggregateRepository.findById).toHaveBeenCalledWith(
          mockGoalId,
        );
        expect(goalAggregateRepository.save).toHaveBeenCalledTimes(1);
        expect(goalAggregateRepository.save).toHaveBeenCalledWith(
          mockGoalAggregate,
        );

        // Verify order of calls
        const findByIdCall = (goalAggregateRepository.findById as jest.Mock)
          .mock.invocationCallOrder[0];
        const saveCall = (goalAggregateRepository.save as jest.Mock).mock
          .invocationCallOrder[0];
        expect(findByIdCall).toBeLessThan(saveCall);
      });

      it('should not call save if contribute throws an error', async () => {
        // Arrange
        const mockGoalAggregate = createMockGoalAggregate();
        const contributionError = new Error('Domain validation failed');
        jest.spyOn(mockGoalAggregate, 'contribute').mockImplementation(() => {
          throw contributionError;
        });

        goalAggregateRepository.findById.mockResolvedValue(mockGoalAggregate);

        // Act & Assert
        await expect(useCase.execute(validInput)).rejects.toThrow(
          contributionError,
        );
        expect(goalAggregateRepository.findById).toHaveBeenCalledTimes(1);
        expect(goalAggregateRepository.save).not.toHaveBeenCalled();
      });

      it('should verify exact parameters passed to contribute method', async () => {
        // Arrange
        const mockGoalAggregate = createMockGoalAggregate();
        const contributeSpy = jest.spyOn(mockGoalAggregate, 'contribute');

        goalAggregateRepository.findById.mockResolvedValue(mockGoalAggregate);
        goalAggregateRepository.save.mockResolvedValue(undefined);

        // Act
        await useCase.execute(validInput);

        // Assert
        expect(contributeSpy).toHaveBeenCalledTimes(1);
        expect(contributeSpy).toHaveBeenCalledWith({
          amount: expect.objectContaining({
            value: validInput.amount,
            currency: Currency.USD,
          }),
          name: validInput.name,
          description: validInput.description,
          recurring: validInput.recurring,
        });
      });
    });
  });
});
