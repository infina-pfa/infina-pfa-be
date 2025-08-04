import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import {
  WithdrawGoalUseCase,
  WithdrawGoalUseCaseInput,
} from '../withdraw-goal.use-case';
import {
  GoalAggregateRepository,
  GoalErrorFactory,
  GoalAggregate,
} from '@/goals/domain';
import { CurrencyVO } from '@/common/base';
import { Currency } from '@/common/types';
import { GoalEntity } from '@/goals/domain/entities/goal.entity';
import { GoalTransactionsWatchList } from '@/goals/domain/watch-list/goal-transactions.watch-list';
import {
  TransactionEntity,
  TransactionType,
} from '@/budgeting/domain/entities/transactions.entity';

describe('WithdrawGoalUseCase', () => {
  let useCase: WithdrawGoalUseCase;
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
        WithdrawGoalUseCase,
        {
          provide: GoalAggregateRepository,
          useValue: goalAggregateRepositoryMock,
        },
      ],
    }).compile();

    useCase = module.get<WithdrawGoalUseCase>(WithdrawGoalUseCase);
    goalAggregateRepository = module.get(GoalAggregateRepository);
  });

  const createMockGoalAggregate = (
    userId: string = mockUserId,
    targetAmount?: CurrencyVO,
    currency: Currency = Currency.USD,
    existingTransactions: TransactionEntity[] = [],
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
        transactions: new GoalTransactionsWatchList(existingTransactions),
      },
      mockGoalId,
    );
  };

  const createContributionTransaction = (
    amount: number,
    currency: Currency = Currency.USD,
  ): TransactionEntity => {
    return TransactionEntity.create({
      amount: new CurrencyVO(amount, currency),
      type: TransactionType.INCOME,
      name: 'Test Contribution',
      description: 'Test contribution transaction',
      recurring: 0,
      userId: mockUserId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  };

  describe('execute', () => {
    const validInput: WithdrawGoalUseCaseInput = {
      goalId: mockGoalId,
      userId: mockUserId,
      amount: 50,
      name: 'Emergency withdrawal',
      description: 'Unexpected medical expense',
      recurring: 0,
    };

    describe('successful withdrawals', () => {
      it('should withdraw from goal with sufficient balance successfully', async () => {
        // Arrange
        const contributionTransaction = createContributionTransaction(100);
        const mockGoalAggregate = createMockGoalAggregate(
          mockUserId,
          new CurrencyVO(5000, Currency.USD),
          Currency.USD,
          [contributionTransaction],
        );
        const withdrawSpy = jest.spyOn(mockGoalAggregate, 'withdraw');

        goalAggregateRepository.findById.mockResolvedValue(mockGoalAggregate);
        goalAggregateRepository.save.mockResolvedValue(undefined);

        // Act
        const result = await useCase.execute(validInput);

        // Assert
        expect(goalAggregateRepository.findById).toHaveBeenCalledWith(
          mockGoalId,
        );
        expect(withdrawSpy).toHaveBeenCalledWith({
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

      it('should withdraw from goal without target amount using current amount currency', async () => {
        // Arrange
        const contributionTransaction = createContributionTransaction(
          200,
          Currency.EUR,
        );
        const mockGoalAggregate = createMockGoalAggregate(
          mockUserId,
          undefined,
          Currency.EUR,
          [contributionTransaction],
        );
        const withdrawSpy = jest.spyOn(mockGoalAggregate, 'withdraw');

        goalAggregateRepository.findById.mockResolvedValue(mockGoalAggregate);
        goalAggregateRepository.save.mockResolvedValue(undefined);

        // Act
        const result = await useCase.execute(validInput);

        // Assert
        expect(withdrawSpy).toHaveBeenCalledWith({
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

      it('should withdraw with minimal required fields', async () => {
        // Arrange
        const minimalInput: WithdrawGoalUseCaseInput = {
          goalId: mockGoalId,
          userId: mockUserId,
          amount: 25,
        };

        const contributionTransaction = createContributionTransaction(100);
        const mockGoalAggregate = createMockGoalAggregate(
          mockUserId,
          undefined,
          Currency.USD,
          [contributionTransaction],
        );
        const withdrawSpy = jest.spyOn(mockGoalAggregate, 'withdraw');

        goalAggregateRepository.findById.mockResolvedValue(mockGoalAggregate);
        goalAggregateRepository.save.mockResolvedValue(undefined);

        // Act
        const result = await useCase.execute(minimalInput);

        // Assert
        expect(withdrawSpy).toHaveBeenCalledWith({
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

      it('should withdraw exactly the available balance', async () => {
        // Arrange
        const availableBalance = 150;
        const contributionTransaction =
          createContributionTransaction(availableBalance);
        const exactWithdrawalInput = {
          ...validInput,
          amount: availableBalance,
        };

        const mockGoalAggregate = createMockGoalAggregate(
          mockUserId,
          undefined,
          Currency.USD,
          [contributionTransaction],
        );
        const withdrawSpy = jest.spyOn(mockGoalAggregate, 'withdraw');

        goalAggregateRepository.findById.mockResolvedValue(mockGoalAggregate);
        goalAggregateRepository.save.mockResolvedValue(undefined);

        // Act
        const result = await useCase.execute(exactWithdrawalInput);

        // Assert
        expect(withdrawSpy).toHaveBeenCalledWith({
          amount: new CurrencyVO(availableBalance, Currency.USD),
          name: exactWithdrawalInput.name,
          description: exactWithdrawalInput.description,
          recurring: exactWithdrawalInput.recurring,
        });
        expect(result).toBe(mockGoalAggregate);
      });

      it('should handle decimal amounts correctly', async () => {
        // Arrange
        const contributionTransaction = createContributionTransaction(200.5);
        const decimalInput = { ...validInput, amount: 123.45 };
        const mockGoalAggregate = createMockGoalAggregate(
          mockUserId,
          undefined,
          Currency.USD,
          [contributionTransaction],
        );
        const withdrawSpy = jest.spyOn(mockGoalAggregate, 'withdraw');

        goalAggregateRepository.findById.mockResolvedValue(mockGoalAggregate);
        goalAggregateRepository.save.mockResolvedValue(undefined);

        // Act
        const result = await useCase.execute(decimalInput);

        // Assert
        expect(withdrawSpy).toHaveBeenCalledWith({
          amount: new CurrencyVO(123.45, Currency.USD),
          name: decimalInput.name,
          description: decimalInput.description,
          recurring: decimalInput.recurring,
        });
        expect(result).toBe(mockGoalAggregate);
      });

      it('should handle very small withdrawal amounts', async () => {
        // Arrange
        const contributionTransaction = createContributionTransaction(1);
        const smallAmountInput = { ...validInput, amount: 0.01 };
        const mockGoalAggregate = createMockGoalAggregate(
          mockUserId,
          undefined,
          Currency.USD,
          [contributionTransaction],
        );
        const withdrawSpy = jest.spyOn(mockGoalAggregate, 'withdraw');

        goalAggregateRepository.findById.mockResolvedValue(mockGoalAggregate);
        goalAggregateRepository.save.mockResolvedValue(undefined);

        // Act
        const result = await useCase.execute(smallAmountInput);

        // Assert
        expect(withdrawSpy).toHaveBeenCalledWith({
          amount: new CurrencyVO(0.01, Currency.USD),
          name: smallAmountInput.name,
          description: smallAmountInput.description,
          recurring: smallAmountInput.recurring,
        });
        expect(result).toBe(mockGoalAggregate);
      });

      it('should handle complex balance scenario with multiple contributions and withdrawals', async () => {
        // Arrange - Net balance: 1000 - 200 + 500 - 100 = 1200
        const transactions = [
          createContributionTransaction(1000), // +1000
          // Simulate previous withdrawal by creating OUTCOME transaction
          TransactionEntity.create({
            amount: new CurrencyVO(200, Currency.USD),
            type: TransactionType.OUTCOME,
            name: 'Previous withdrawal',
            description: 'Previous withdrawal',
            recurring: 0,
            userId: mockUserId,
            createdAt: new Date(),
            updatedAt: new Date(),
          }),
          createContributionTransaction(500), // +500
          TransactionEntity.create({
            amount: new CurrencyVO(100, Currency.USD),
            type: TransactionType.OUTCOME,
            name: 'Another withdrawal',
            description: 'Another previous withdrawal',
            recurring: 0,
            userId: mockUserId,
            createdAt: new Date(),
            updatedAt: new Date(),
          }),
        ];

        const withdrawalInput = { ...validInput, amount: 1200 }; // Withdraw exactly the available balance
        const mockGoalAggregate = createMockGoalAggregate(
          mockUserId,
          undefined,
          Currency.USD,
          transactions,
        );
        const withdrawSpy = jest.spyOn(mockGoalAggregate, 'withdraw');

        goalAggregateRepository.findById.mockResolvedValue(mockGoalAggregate);
        goalAggregateRepository.save.mockResolvedValue(undefined);

        // Act
        const result = await useCase.execute(withdrawalInput);

        // Assert
        expect(withdrawSpy).toHaveBeenCalledWith({
          amount: new CurrencyVO(1200, Currency.USD),
          name: withdrawalInput.name,
          description: withdrawalInput.description,
          recurring: withdrawalInput.recurring,
        });
        expect(result).toBe(mockGoalAggregate);
      });

      it('should handle different currencies correctly', async () => {
        // Arrange
        const contributionTransaction = createContributionTransaction(
          10000,
          Currency.VND,
        );
        const mockGoalAggregate = createMockGoalAggregate(
          mockUserId,
          new CurrencyVO(50000, Currency.VND),
          Currency.VND,
          [contributionTransaction],
        );
        const withdrawSpy = jest.spyOn(mockGoalAggregate, 'withdraw');

        goalAggregateRepository.findById.mockResolvedValue(mockGoalAggregate);
        goalAggregateRepository.save.mockResolvedValue(undefined);

        // Act
        const result = await useCase.execute(validInput);

        // Assert
        expect(withdrawSpy).toHaveBeenCalledWith({
          amount: new CurrencyVO(validInput.amount, Currency.VND), // Uses goal's currency
          name: validInput.name,
          description: validInput.description,
          recurring: validInput.recurring,
        });
        expect(result).toBe(mockGoalAggregate);
      });
    });

    describe('insufficient balance scenarios', () => {
      it('should throw GOAL_INSUFFICIENT_BALANCE error when withdrawal exceeds balance', async () => {
        // Arrange
        const contributionTransaction = createContributionTransaction(100);
        const insufficientInput = { ...validInput, amount: 150 }; // More than the 100 available
        const mockGoalAggregate = createMockGoalAggregate(
          mockUserId,
          undefined,
          Currency.USD,
          [contributionTransaction],
        );

        goalAggregateRepository.findById.mockResolvedValue(mockGoalAggregate);

        // Act & Assert
        await expect(useCase.execute(insufficientInput)).rejects.toThrow(
          GoalErrorFactory.goalInsufficientBalance(150, 100),
        );
        expect(goalAggregateRepository.save).not.toHaveBeenCalled();
      });

      it('should throw GOAL_INSUFFICIENT_BALANCE error when goal has no contributions', async () => {
        // Arrange - Goal with no contributions (zero balance)
        const mockGoalAggregate = createMockGoalAggregate(
          mockUserId,
          undefined,
          Currency.USD,
          [],
        );
        goalAggregateRepository.findById.mockResolvedValue(mockGoalAggregate);

        // Act & Assert
        await expect(useCase.execute(validInput)).rejects.toThrow(
          GoalErrorFactory.goalInsufficientBalance(validInput.amount, 0),
        );
        expect(goalAggregateRepository.save).not.toHaveBeenCalled();
      });

      it('should throw GOAL_INSUFFICIENT_BALANCE error when net balance is zero due to previous withdrawals', async () => {
        // Arrange - Equal contributions and withdrawals (net = 0)
        const transactions = [
          createContributionTransaction(100),
          TransactionEntity.create({
            amount: new CurrencyVO(100, Currency.USD),
            type: TransactionType.OUTCOME,
            name: 'Previous withdrawal',
            description: 'Previous full withdrawal',
            recurring: 0,
            userId: mockUserId,
            createdAt: new Date(),
            updatedAt: new Date(),
          }),
        ];

        const mockGoalAggregate = createMockGoalAggregate(
          mockUserId,
          undefined,
          Currency.USD,
          transactions,
        );
        goalAggregateRepository.findById.mockResolvedValue(mockGoalAggregate);

        // Act & Assert
        await expect(useCase.execute(validInput)).rejects.toThrow(
          GoalErrorFactory.goalInsufficientBalance(validInput.amount, 0),
        );
        expect(goalAggregateRepository.save).not.toHaveBeenCalled();
      });

      it('should throw GOAL_INSUFFICIENT_BALANCE error with correct decimal values', async () => {
        // Arrange
        const contributionTransaction = createContributionTransaction(50.25);
        const insufficientInput = { ...validInput, amount: 50.26 }; // 0.01 more than available
        const mockGoalAggregate = createMockGoalAggregate(
          mockUserId,
          undefined,
          Currency.USD,
          [contributionTransaction],
        );

        goalAggregateRepository.findById.mockResolvedValue(mockGoalAggregate);

        // Act & Assert
        await expect(useCase.execute(insufficientInput)).rejects.toThrow(
          GoalErrorFactory.goalInsufficientBalance(50.26, 50.25),
        );
        expect(goalAggregateRepository.save).not.toHaveBeenCalled();
      });

      it('should throw GOAL_INSUFFICIENT_BALANCE error when trying to withdraw very small amount from zero balance', async () => {
        // Arrange
        const mockGoalAggregate = createMockGoalAggregate(
          mockUserId,
          undefined,
          Currency.USD,
          [],
        );
        const smallWithdrawalInput = { ...validInput, amount: 0.01 };

        goalAggregateRepository.findById.mockResolvedValue(mockGoalAggregate);

        // Act & Assert
        await expect(useCase.execute(smallWithdrawalInput)).rejects.toThrow(
          GoalErrorFactory.goalInsufficientBalance(0.01, 0),
        );
        expect(goalAggregateRepository.save).not.toHaveBeenCalled();
      });

      it('should throw GOAL_INSUFFICIENT_BALANCE error with complex transaction history', async () => {
        // Arrange - Net balance: 1000 - 800 + 200 - 350 = 50
        const transactions = [
          createContributionTransaction(1000),
          TransactionEntity.create({
            amount: new CurrencyVO(800, Currency.USD),
            type: TransactionType.OUTCOME,
            name: 'Large withdrawal',
            description: 'Large previous withdrawal',
            recurring: 0,
            userId: mockUserId,
            createdAt: new Date(),
            updatedAt: new Date(),
          }),
          createContributionTransaction(200),
          TransactionEntity.create({
            amount: new CurrencyVO(350, Currency.USD),
            type: TransactionType.OUTCOME,
            name: 'Another withdrawal',
            description: 'Another withdrawal',
            recurring: 0,
            userId: mockUserId,
            createdAt: new Date(),
            updatedAt: new Date(),
          }),
        ];

        const insufficientInput = { ...validInput, amount: 51 }; // 1 more than the 50 available
        const mockGoalAggregate = createMockGoalAggregate(
          mockUserId,
          undefined,
          Currency.USD,
          transactions,
        );

        goalAggregateRepository.findById.mockResolvedValue(mockGoalAggregate);

        // Act & Assert
        await expect(useCase.execute(insufficientInput)).rejects.toThrow(
          GoalErrorFactory.goalInsufficientBalance(51, 50),
        );
        expect(goalAggregateRepository.save).not.toHaveBeenCalled();
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
        const contributionTransaction = createContributionTransaction(100);
        const mockGoalAggregate = createMockGoalAggregate(
          'different-user-id',
          undefined,
          Currency.USD,
          [contributionTransaction],
        );
        goalAggregateRepository.findById.mockResolvedValue(mockGoalAggregate);

        // Act & Assert
        await expect(useCase.execute(validInput)).rejects.toThrow(
          GoalErrorFactory.goalNotFound(), // For security, don't reveal goal exists
        );
        expect(goalAggregateRepository.save).not.toHaveBeenCalled();
      });

      it('should propagate domain validation errors from withdraw method', async () => {
        // Arrange
        const contributionTransaction = createContributionTransaction(100);
        const mockGoalAggregate = createMockGoalAggregate(
          mockUserId,
          undefined,
          Currency.USD,
          [contributionTransaction],
        );
        const domainError = new Error('Withdrawal amount must be positive');
        jest.spyOn(mockGoalAggregate, 'withdraw').mockImplementation(() => {
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
        const contributionTransaction = createContributionTransaction(100);
        const mockGoalAggregate = createMockGoalAggregate(
          mockUserId,
          undefined,
          Currency.USD,
          [contributionTransaction],
        );
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
        const contributionTransaction = createContributionTransaction(100);
        const emptyStringInput = {
          ...validInput,
          name: '',
          description: '',
        };
        const mockGoalAggregate = createMockGoalAggregate(
          mockUserId,
          undefined,
          Currency.USD,
          [contributionTransaction],
        );
        const withdrawSpy = jest.spyOn(mockGoalAggregate, 'withdraw');

        goalAggregateRepository.findById.mockResolvedValue(mockGoalAggregate);
        goalAggregateRepository.save.mockResolvedValue(undefined);

        // Act
        const result = await useCase.execute(emptyStringInput);

        // Assert
        expect(withdrawSpy).toHaveBeenCalledWith({
          amount: new CurrencyVO(emptyStringInput.amount, Currency.USD),
          name: '',
          description: '',
          recurring: emptyStringInput.recurring,
        });
        expect(result).toBe(mockGoalAggregate);
      });

      it('should handle goal with both target and current amount in different currencies', async () => {
        // Arrange - This should not happen in practice, but test defensive behavior
        const contributionTransaction = createContributionTransaction(
          100,
          Currency.EUR,
        );
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
            transactions: new GoalTransactionsWatchList([
              contributionTransaction,
            ]),
          },
          mockGoalId,
        );

        const withdrawSpy = jest.spyOn(mockGoalAggregate, 'withdraw');

        goalAggregateRepository.findById.mockResolvedValue(mockGoalAggregate);
        goalAggregateRepository.save.mockResolvedValue(undefined);

        // Act
        const result = await useCase.execute(validInput);

        // Assert - Should prioritize target amount currency
        expect(withdrawSpy).toHaveBeenCalledWith({
          amount: new CurrencyVO(validInput.amount, Currency.EUR), // Uses target amount currency
          name: validInput.name,
          description: validInput.description,
          recurring: validInput.recurring,
        });
        expect(result).toBe(mockGoalAggregate);
      });

      it('should handle withdrawal from goal with very large balance', async () => {
        // Arrange
        const largeContribution = createContributionTransaction(
          Number.MAX_SAFE_INTEGER - 1,
        );
        const mockGoalAggregate = createMockGoalAggregate(
          mockUserId,
          undefined,
          Currency.USD,
          [largeContribution],
        );
        const withdrawSpy = jest.spyOn(mockGoalAggregate, 'withdraw');

        goalAggregateRepository.findById.mockResolvedValue(mockGoalAggregate);
        goalAggregateRepository.save.mockResolvedValue(undefined);

        // Act
        const result = await useCase.execute(validInput);

        // Assert
        expect(withdrawSpy).toHaveBeenCalledWith({
          amount: new CurrencyVO(validInput.amount, Currency.USD),
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
        const contributionTransaction = createContributionTransaction(100);
        const mockGoalAggregate = createMockGoalAggregate(
          mockUserId,
          undefined,
          Currency.USD,
          [contributionTransaction],
        );
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

      it('should not call save if withdraw throws an error', async () => {
        // Arrange
        const contributionTransaction = createContributionTransaction(100);
        const mockGoalAggregate = createMockGoalAggregate(
          mockUserId,
          undefined,
          Currency.USD,
          [contributionTransaction],
        );
        const withdrawalError = new Error('Domain validation failed');
        jest.spyOn(mockGoalAggregate, 'withdraw').mockImplementation(() => {
          throw withdrawalError;
        });

        goalAggregateRepository.findById.mockResolvedValue(mockGoalAggregate);

        // Act & Assert
        await expect(useCase.execute(validInput)).rejects.toThrow(
          withdrawalError,
        );
        expect(goalAggregateRepository.findById).toHaveBeenCalledTimes(1);
        expect(goalAggregateRepository.save).not.toHaveBeenCalled();
      });

      it('should verify exact parameters passed to withdraw method', async () => {
        // Arrange
        const contributionTransaction = createContributionTransaction(100);
        const mockGoalAggregate = createMockGoalAggregate(
          mockUserId,
          undefined,
          Currency.USD,
          [contributionTransaction],
        );
        const withdrawSpy = jest.spyOn(mockGoalAggregate, 'withdraw');

        goalAggregateRepository.findById.mockResolvedValue(mockGoalAggregate);
        goalAggregateRepository.save.mockResolvedValue(undefined);

        // Act
        await useCase.execute(validInput);

        // Assert
        expect(withdrawSpy).toHaveBeenCalledTimes(1);
        expect(withdrawSpy).toHaveBeenCalledWith({
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
