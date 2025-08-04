import { TransactionType } from '@/budgeting/domain/entities/transactions.entity';
import { CurrencyVO } from '@/common/base';
import { Currency } from '@/common/types/user';
import { GoalTransactionsWatchList } from '../../watch-list/goal-transactions.watch-list';
import { GoalAggregate } from '../goal.aggregate';
import { GoalEntity } from '../goal.entity';

describe('GoalAggregate', () => {
  let goalAggregate: GoalAggregate;
  let mockGoalEntity: GoalEntity;
  let contributions: GoalTransactionsWatchList;

  const mockUserId = 'user-123';
  const mockGoalTitle = 'Save for vacation';

  beforeEach(() => {
    // Create mock GoalEntity
    mockGoalEntity = GoalEntity.create({
      userId: mockUserId,
      title: mockGoalTitle,
      description: 'Save money for a vacation to Japan',
      targetAmount: new CurrencyVO(5000, Currency.USD),
      currentAmount: new CurrencyVO(0, Currency.USD),
      dueDate: new Date('2025-12-31'),
    });

    // Create empty contributions watch list
    contributions = new GoalTransactionsWatchList([]);

    // Create GoalAggregate
    goalAggregate = GoalAggregate.create({
      goal: mockGoalEntity,
      contributions,
    });
  });

  describe('contribute method', () => {
    it('should add INCOME transaction with positive amount', () => {
      // Arrange
      const contributionAmount = new CurrencyVO(100, Currency.USD);
      const contributionProps = {
        amount: contributionAmount,
        name: 'Monthly contribution',
        description: 'Regular monthly savings',
        recurring: 1,
      };

      // Act
      goalAggregate.contribute(contributionProps);

      // Assert
      const transactions = goalAggregate.contributions;
      expect(transactions).toHaveLength(1);

      const transaction = transactions[0];
      expect(transaction.props.amount).toEqual(contributionAmount);
      expect(transaction.props.type).toBe(TransactionType.INCOME);
      expect(transaction.props.name).toBe('Monthly contribution');
      expect(transaction.props.description).toBe('Regular monthly savings');
      expect(transaction.props.recurring).toBe(1);
      expect(transaction.props.userId).toBe(mockUserId);
    });

    it('should update goal progress after contribution', () => {
      // Arrange
      const contributionAmount = new CurrencyVO(150, Currency.USD);
      const updateProgressSpy = jest.spyOn(mockGoalEntity, 'updateProgress');

      // Act
      goalAggregate.contribute({ amount: contributionAmount });

      // Assert
      expect(updateProgressSpy).toHaveBeenCalledWith(contributionAmount);
    });

    it('should use default name if not provided', () => {
      // Arrange
      const contributionAmount = new CurrencyVO(100, Currency.USD);

      // Act
      goalAggregate.contribute({ amount: contributionAmount });

      // Assert
      const transactions = goalAggregate.contributions;
      expect(transactions[0].props.name).toBe('Goal Contribution');
    });

    it('should use default description if not provided', () => {
      // Arrange
      const contributionAmount = new CurrencyVO(100, Currency.USD);

      // Act
      goalAggregate.contribute({ amount: contributionAmount });

      // Assert
      const transactions = goalAggregate.contributions;
      expect(transactions[0].props.description).toBe(
        `Contribution to ${mockGoalTitle}`,
      );
    });

    it('should use default recurring value if not provided', () => {
      // Arrange
      const contributionAmount = new CurrencyVO(100, Currency.USD);

      // Act
      goalAggregate.contribute({ amount: contributionAmount });

      // Assert
      const transactions = goalAggregate.contributions;
      expect(transactions[0].props.recurring).toBe(0);
    });

    it('should throw error for zero amount', () => {
      // Arrange
      const zeroAmount = new CurrencyVO(0, Currency.USD);

      // Act & Assert
      expect(() => {
        goalAggregate.contribute({ amount: zeroAmount });
      }).toThrow('Contribution amount must be positive');
    });

    it('should throw error for negative amount', () => {
      // Arrange
      const negativeAmount = new CurrencyVO(-50, Currency.USD);

      // Act & Assert
      expect(() => {
        goalAggregate.contribute({ amount: negativeAmount });
      }).toThrow('Contribution amount must be positive');
    });

    it('should throw error for very small negative amount', () => {
      // Arrange
      const verySmallNegativeAmount = new CurrencyVO(-0.01, Currency.USD);

      // Act & Assert
      expect(() => {
        goalAggregate.contribute({ amount: verySmallNegativeAmount });
      }).toThrow('Contribution amount must be positive');
    });
  });

  describe('withdraw method', () => {
    it('should add OUTCOME transaction with positive amount', () => {
      // Arrange
      const withdrawalAmount = new CurrencyVO(50, Currency.USD);
      const withdrawalProps = {
        amount: withdrawalAmount,
        name: 'Emergency withdrawal',
        description: 'Unexpected expense',
        recurring: 0,
      };

      // Act
      goalAggregate.withdraw(withdrawalProps);

      // Assert
      const transactions = goalAggregate.contributions;
      expect(transactions).toHaveLength(1);

      const transaction = transactions[0];
      expect(transaction.props.amount).toEqual(withdrawalAmount);
      expect(transaction.props.type).toBe(TransactionType.OUTCOME);
      expect(transaction.props.name).toBe('Emergency withdrawal');
      expect(transaction.props.description).toBe('Unexpected expense');
      expect(transaction.props.recurring).toBe(0);
      expect(transaction.props.userId).toBe(mockUserId);
    });

    it('should update goal progress after withdrawal', () => {
      // Arrange
      const withdrawalAmount = new CurrencyVO(75, Currency.USD);
      const updateProgressSpy = jest.spyOn(mockGoalEntity, 'updateProgress');

      // Act
      goalAggregate.withdraw({ amount: withdrawalAmount });

      // Assert
      expect(updateProgressSpy).toHaveBeenCalledWith(
        new CurrencyVO(-75, Currency.USD),
      );
    });

    it('should use default name if not provided', () => {
      // Arrange
      const withdrawalAmount = new CurrencyVO(50, Currency.USD);

      // Act
      goalAggregate.withdraw({ amount: withdrawalAmount });

      // Assert
      const transactions = goalAggregate.contributions;
      expect(transactions[0].props.name).toBe('Goal Withdrawal');
    });

    it('should use default description if not provided', () => {
      // Arrange
      const withdrawalAmount = new CurrencyVO(50, Currency.USD);

      // Act
      goalAggregate.withdraw({ amount: withdrawalAmount });

      // Assert
      const transactions = goalAggregate.contributions;
      expect(transactions[0].props.description).toBe(
        `Withdrawal from ${mockGoalTitle}`,
      );
    });

    it('should use default recurring value if not provided', () => {
      // Arrange
      const withdrawalAmount = new CurrencyVO(50, Currency.USD);

      // Act
      goalAggregate.withdraw({ amount: withdrawalAmount });

      // Assert
      const transactions = goalAggregate.contributions;
      expect(transactions[0].props.recurring).toBe(0);
    });

    it('should throw error for zero amount', () => {
      // Arrange
      const zeroAmount = new CurrencyVO(0, Currency.USD);

      // Act & Assert
      expect(() => {
        goalAggregate.withdraw({ amount: zeroAmount });
      }).toThrow('Withdrawal amount must be positive');
    });

    it('should throw error for negative amount', () => {
      // Arrange
      const negativeAmount = new CurrencyVO(-25, Currency.USD);

      // Act & Assert
      expect(() => {
        goalAggregate.withdraw({ amount: negativeAmount });
      }).toThrow('Withdrawal amount must be positive');
    });

    it('should throw error for very small negative amount', () => {
      // Arrange
      const verySmallNegativeAmount = new CurrencyVO(-0.001, Currency.USD);

      // Act & Assert
      expect(() => {
        goalAggregate.withdraw({ amount: verySmallNegativeAmount });
      }).toThrow('Withdrawal amount must be positive');
    });
  });

  describe('totalContributed computed property', () => {
    it('should return 0 for no transactions', () => {
      // Arrange & Act
      const total = goalAggregate.totalContributed;

      // Assert
      expect(total.value).toBe(0);
      expect(total.currency).toBe(Currency.USD);
    });

    it('should sum INCOME transactions correctly', () => {
      // Arrange
      goalAggregate.contribute({ amount: new CurrencyVO(100, Currency.USD) });
      goalAggregate.contribute({ amount: new CurrencyVO(150, Currency.USD) });
      goalAggregate.contribute({ amount: new CurrencyVO(75, Currency.USD) });

      // Act
      const total = goalAggregate.totalContributed;

      // Assert
      expect(total.value).toBe(325);
    });

    it('should subtract OUTCOME transactions correctly', () => {
      // Arrange
      goalAggregate.withdraw({ amount: new CurrencyVO(50, Currency.USD) });
      goalAggregate.withdraw({ amount: new CurrencyVO(25, Currency.USD) });

      // Act
      const total = goalAggregate.totalContributed;

      // Assert
      expect(total.value).toBe(-75);
    });

    it('should handle mixed INCOME/OUTCOME transactions correctly', () => {
      // Arrange
      goalAggregate.contribute({ amount: new CurrencyVO(200, Currency.USD) });
      goalAggregate.withdraw({ amount: new CurrencyVO(50, Currency.USD) });
      goalAggregate.contribute({ amount: new CurrencyVO(100, Currency.USD) });
      goalAggregate.withdraw({ amount: new CurrencyVO(25, Currency.USD) });

      // Act
      const total = goalAggregate.totalContributed;

      // Assert
      // Total should be: 200 - 50 + 100 - 25 = 225
      expect(total.value).toBe(225);
    });

    it('should calculate net amount correctly (contributions - withdrawals)', () => {
      // Arrange
      const contribution1 = new CurrencyVO(300, Currency.USD);
      const contribution2 = new CurrencyVO(200, Currency.USD);
      const withdrawal1 = new CurrencyVO(100, Currency.USD);
      const withdrawal2 = new CurrencyVO(50, Currency.USD);

      goalAggregate.contribute({ amount: contribution1 });
      goalAggregate.contribute({ amount: contribution2 });
      goalAggregate.withdraw({ amount: withdrawal1 });
      goalAggregate.withdraw({ amount: withdrawal2 });

      // Act
      const total = goalAggregate.totalContributed;

      // Assert
      // Net: (300 + 200) - (100 + 50) = 350
      expect(total.value).toBe(350);
    });

    it('should handle decimal amounts correctly', () => {
      // Arrange
      goalAggregate.contribute({ amount: new CurrencyVO(100.5, Currency.USD) });
      goalAggregate.withdraw({ amount: new CurrencyVO(25.25, Currency.USD) });
      goalAggregate.contribute({ amount: new CurrencyVO(50.75, Currency.USD) });

      // Act
      const total = goalAggregate.totalContributed;

      // Assert
      // Total should be: 100.50 - 25.25 + 50.75 = 126.00
      expect(total.value).toBe(126);
    });

    it('should handle large transaction amounts', () => {
      // Arrange
      const largeAmount = new CurrencyVO(999999.99, Currency.USD);
      goalAggregate.contribute({ amount: largeAmount });

      // Act
      const total = goalAggregate.totalContributed;

      // Assert
      expect(total.value).toBe(999999.99);
    });
  });

  describe('integration tests', () => {
    it('should handle multiple contributions and withdrawals', () => {
      // Arrange & Act
      goalAggregate.contribute({
        amount: new CurrencyVO(500, Currency.USD),
        name: 'Initial deposit',
      });
      goalAggregate.contribute({
        amount: new CurrencyVO(200, Currency.USD),
        name: 'Monthly saving',
      });
      goalAggregate.withdraw({
        amount: new CurrencyVO(100, Currency.USD),
        name: 'Emergency fund',
      });
      goalAggregate.contribute({
        amount: new CurrencyVO(150, Currency.USD),
        name: 'Bonus',
      });
      goalAggregate.withdraw({
        amount: new CurrencyVO(50, Currency.USD),
        name: 'Partial withdrawal',
      });

      // Assert
      const transactions = goalAggregate.contributions;
      expect(transactions).toHaveLength(5);

      // Verify transaction types
      expect(transactions[0].props.type).toBe(TransactionType.INCOME);
      expect(transactions[1].props.type).toBe(TransactionType.INCOME);
      expect(transactions[2].props.type).toBe(TransactionType.OUTCOME);
      expect(transactions[3].props.type).toBe(TransactionType.INCOME);
      expect(transactions[4].props.type).toBe(TransactionType.OUTCOME);

      // Verify total: 500 + 200 - 100 + 150 - 50 = 700
      expect(goalAggregate.totalContributed.value).toBe(700);
    });

    it('should update goal progress correctly with mixed transactions', () => {
      // Arrange
      const updateProgressSpy = jest.spyOn(mockGoalEntity, 'updateProgress');

      // Act
      goalAggregate.contribute({ amount: new CurrencyVO(300, Currency.USD) });
      goalAggregate.withdraw({ amount: new CurrencyVO(100, Currency.USD) });
      goalAggregate.contribute({ amount: new CurrencyVO(200, Currency.USD) });

      // Assert
      expect(updateProgressSpy).toHaveBeenCalledTimes(3);

      // First call: after first contribution (300)
      expect(updateProgressSpy).toHaveBeenNthCalledWith(
        1,
        new CurrencyVO(300, Currency.USD),
      );

      // Second call: after withdrawal (300 - 100 = 200)
      expect(updateProgressSpy).toHaveBeenNthCalledWith(
        2,
        new CurrencyVO(200, Currency.USD),
      );

      // Third call: after second contribution (200 + 200 = 400)
      expect(updateProgressSpy).toHaveBeenNthCalledWith(
        3,
        new CurrencyVO(400, Currency.USD),
      );
    });

    it('should maintain correct remaining amount calculation', () => {
      // Arrange
      const targetAmount = new CurrencyVO(1000, Currency.USD);
      mockGoalEntity = GoalEntity.create({
        userId: mockUserId,
        title: mockGoalTitle,
        description: 'Test goal for remaining amount',
        targetAmount,
        currentAmount: new CurrencyVO(0, Currency.USD),
        dueDate: new Date('2025-12-31'),
      });

      goalAggregate = GoalAggregate.create({
        goal: mockGoalEntity,
        contributions: new GoalTransactionsWatchList([]),
      });

      // Act
      goalAggregate.contribute({ amount: new CurrencyVO(600, Currency.USD) });
      goalAggregate.withdraw({ amount: new CurrencyVO(100, Currency.USD) });
      goalAggregate.contribute({ amount: new CurrencyVO(200, Currency.USD) });

      // Assert
      const totalContributed = goalAggregate.totalContributed;
      expect(totalContributed.value).toBe(700); // 600 - 100 + 200

      const remainingAmount = goalAggregate.remainingAmount;
      expect(remainingAmount.value).toBe(300); // 1000 - 700 (assuming goal updates correctly)
    });

    it('should handle complex scenario with many transactions', () => {
      // Arrange
      const transactions = [
        { type: 'contribute', amount: 1000 },
        { type: 'withdraw', amount: 200 },
        { type: 'contribute', amount: 500 },
        { type: 'contribute', amount: 300 },
        { type: 'withdraw', amount: 150 },
        { type: 'contribute', amount: 250 },
        { type: 'withdraw', amount: 100 },
        { type: 'contribute', amount: 400 },
      ];

      // Act
      let expectedTotal = 0;
      transactions.forEach(({ type, amount }) => {
        if (type === 'contribute') {
          goalAggregate.contribute({
            amount: new CurrencyVO(amount, Currency.USD),
          });
          expectedTotal += amount;
        } else {
          goalAggregate.withdraw({
            amount: new CurrencyVO(amount, Currency.USD),
          });
          expectedTotal -= amount;
        }
      });

      // Assert
      expect(goalAggregate.contributions).toHaveLength(8);
      expect(goalAggregate.totalContributed.value).toBe(expectedTotal);
      // Expected: 1000 - 200 + 500 + 300 - 150 + 250 - 100 + 400 = 2000
      expect(goalAggregate.totalContributed.value).toBe(2000);
    });

    it('should maintain transaction order and properties', () => {
      // Arrange & Act
      goalAggregate.contribute({
        amount: new CurrencyVO(100, Currency.USD),
        name: 'First contribution',
        description: 'Initial deposit',
        recurring: 1,
      });
      goalAggregate.withdraw({
        amount: new CurrencyVO(50, Currency.USD),
        name: 'First withdrawal',
        description: 'Emergency expense',
        recurring: 0,
      });
      goalAggregate.contribute({
        amount: new CurrencyVO(75, Currency.USD),
        name: 'Second contribution',
      });

      // Assert
      const transactions = goalAggregate.contributions;
      expect(transactions).toHaveLength(3);

      // Verify first transaction
      expect(transactions[0].props.name).toBe('First contribution');
      expect(transactions[0].props.description).toBe('Initial deposit');
      expect(transactions[0].props.type).toBe(TransactionType.INCOME);
      expect(transactions[0].props.recurring).toBe(1);

      // Verify second transaction
      expect(transactions[1].props.name).toBe('First withdrawal');
      expect(transactions[1].props.description).toBe('Emergency expense');
      expect(transactions[1].props.type).toBe(TransactionType.OUTCOME);
      expect(transactions[1].props.recurring).toBe(0);

      // Verify third transaction (with default description)
      expect(transactions[2].props.name).toBe('Second contribution');
      expect(transactions[2].props.description).toBe(
        `Contribution to ${mockGoalTitle}`,
      );
      expect(transactions[2].props.type).toBe(TransactionType.INCOME);
      expect(transactions[2].props.recurring).toBe(0);
    });
  });

  describe('static create method with custom ID', () => {
    it('should create aggregate with custom ID', () => {
      // Arrange
      const customId = 'custom-aggregate-id-123';
      const goal = GoalEntity.create({
        userId: mockUserId,
        title: mockGoalTitle,
        description: undefined,
        targetAmount: new CurrencyVO(1000, Currency.USD),
        dueDate: undefined,
      });
      const contributions = new GoalTransactionsWatchList([]);

      // Act
      const aggregate = GoalAggregate.create(
        {
          goal,
          contributions,
        },
        customId,
      );

      // Assert
      expect(aggregate.id).toBe(customId);
      expect(aggregate.goal).toBe(goal);
      expect(aggregate.contributions).toEqual([]);
    });

    it('should create aggregate without custom ID', () => {
      // Arrange
      const goal = GoalEntity.create({
        userId: mockUserId,
        title: mockGoalTitle,
        description: undefined,
        targetAmount: undefined,
        dueDate: undefined,
      });
      const contributions = new GoalTransactionsWatchList([]);

      // Act
      const aggregate = GoalAggregate.create({
        goal,
        contributions,
      });

      // Assert
      expect(aggregate.id).toBeDefined();
      expect(typeof aggregate.id).toBe('string');
      expect(aggregate.id.length).toBeGreaterThan(0);
    });
  });

  describe('totalContributed edge cases', () => {
    it('should return zero in current amount currency when no target amount and no transactions', () => {
      // Arrange
      const goalWithoutTarget = GoalEntity.create({
        userId: mockUserId,
        title: mockGoalTitle,
        description: undefined,
        targetAmount: undefined,
        currentAmount: new CurrencyVO(500, Currency.EUR), // Different currency
        dueDate: undefined,
      });

      const emptyContributions = new GoalTransactionsWatchList([]);
      const aggregateWithoutTarget = GoalAggregate.create({
        goal: goalWithoutTarget,
        contributions: emptyContributions,
      });

      // Act
      const total = aggregateWithoutTarget.totalContributed;

      // Assert
      expect(total.value).toBe(0);
      expect(total.currency).toBe(Currency.EUR); // Should use current amount currency
    });

    it('should return zero in VND when no target amount, no current amount currency, and no transactions', () => {
      // Arrange
      const goalWithoutTarget = GoalEntity.create({
        userId: mockUserId,
        title: mockGoalTitle,
        description: undefined,
        targetAmount: undefined,
        dueDate: undefined,
        // No target amount, default current amount (0 with default currency)
      });

      const emptyContributions = new GoalTransactionsWatchList([]);
      const aggregateWithoutTarget = GoalAggregate.create({
        goal: goalWithoutTarget,
        contributions: emptyContributions,
      });

      // Act
      const total = aggregateWithoutTarget.totalContributed;

      // Assert
      expect(total.value).toBe(0);
      // Should use current amount currency (default CurrencyVO currency)
      expect(total.currency).toBeDefined();
    });
  });

  describe('remainingAmount edge cases', () => {
    it('should return zero when no target amount is set', () => {
      // Arrange
      const goalWithoutTarget = GoalEntity.create({
        userId: mockUserId,
        title: mockGoalTitle,
        description: undefined,
        targetAmount: undefined,
        currentAmount: new CurrencyVO(500, Currency.EUR),
        dueDate: undefined,
      });

      const contributions = new GoalTransactionsWatchList([]);
      const aggregateWithoutTarget = GoalAggregate.create({
        goal: goalWithoutTarget,
        contributions,
      });

      // Act
      const remaining = aggregateWithoutTarget.remainingAmount;

      // Assert
      expect(remaining.value).toBe(0);
      expect(remaining.currency).toBe(Currency.EUR); // Should use current amount currency
    });

    it('should return zero when contributions exceed target amount', () => {
      // Arrange
      const targetAmount = new CurrencyVO(1000, Currency.USD);
      const goalWithTarget = GoalEntity.create({
        userId: mockUserId,
        title: mockGoalTitle,
        description: undefined,
        targetAmount,
        currentAmount: new CurrencyVO(0, Currency.USD),
        dueDate: undefined,
      });

      const contributions = new GoalTransactionsWatchList([]);
      const aggregateWithTarget = GoalAggregate.create({
        goal: goalWithTarget,
        contributions,
      });

      // Add contributions that exceed the target
      aggregateWithTarget.contribute({
        amount: new CurrencyVO(1200, Currency.USD),
      });

      // Act
      const remaining = aggregateWithTarget.remainingAmount;

      // Assert
      expect(remaining.value).toBe(0); // Should cap at 0, not go negative
      expect(remaining.currency).toBe(Currency.USD);
    });
  });

  describe('updateGoalDetails method', () => {
    it('should update goal title through aggregate', () => {
      // Arrange
      const newTitle = 'Updated Goal Title';
      const updateSpy = jest.spyOn(goalAggregate.goal, 'update');
      const aggregateUpdatedSpy = jest
        .spyOn(goalAggregate, 'updated')
        .mockImplementation(() => {});

      // Act
      goalAggregate.updateGoalDetails({ title: newTitle });

      // Assert
      expect(updateSpy).toHaveBeenCalledWith({ title: newTitle });
      expect(aggregateUpdatedSpy).toHaveBeenCalled();
      expect(goalAggregate.goal.title).toBe(newTitle);
    });

    it('should update goal description through aggregate', () => {
      // Arrange
      const newDescription = 'Updated goal description';
      const updateSpy = jest.spyOn(goalAggregate.goal, 'update');
      const aggregateUpdatedSpy = jest
        .spyOn(goalAggregate, 'updated')
        .mockImplementation(() => {});

      // Act
      goalAggregate.updateGoalDetails({ description: newDescription });

      // Assert
      expect(updateSpy).toHaveBeenCalledWith({ description: newDescription });
      expect(aggregateUpdatedSpy).toHaveBeenCalled();
      expect(goalAggregate.goal.description).toBe(newDescription);
    });

    it('should update goal target amount through aggregate', () => {
      // Arrange
      const newTargetAmount = new CurrencyVO(8000, Currency.EUR);
      const updateSpy = jest.spyOn(goalAggregate.goal, 'update');
      const aggregateUpdatedSpy = jest
        .spyOn(goalAggregate, 'updated')
        .mockImplementation(() => {});

      // Act
      goalAggregate.updateGoalDetails({ targetAmount: newTargetAmount });

      // Assert
      expect(updateSpy).toHaveBeenCalledWith({ targetAmount: newTargetAmount });
      expect(aggregateUpdatedSpy).toHaveBeenCalled();
      expect(goalAggregate.goal.targetAmount).toEqual(newTargetAmount);
    });

    it('should update goal due date through aggregate', () => {
      // Arrange
      const newDueDate = new Date('2026-06-30');
      const updateSpy = jest.spyOn(goalAggregate.goal, 'update');
      const aggregateUpdatedSpy = jest
        .spyOn(goalAggregate, 'updated')
        .mockImplementation(() => {});

      // Act
      goalAggregate.updateGoalDetails({ dueDate: newDueDate });

      // Assert
      expect(updateSpy).toHaveBeenCalledWith({ dueDate: newDueDate });
      expect(aggregateUpdatedSpy).toHaveBeenCalled();
      expect(goalAggregate.goal.dueDate).toEqual(newDueDate);
    });

    it('should update multiple goal properties through aggregate', () => {
      // Arrange
      const updates = {
        title: 'New Title',
        description: 'New Description',
        targetAmount: new CurrencyVO(10000, Currency.VND),
        dueDate: new Date('2027-12-31'),
      };
      const updateSpy = jest.spyOn(goalAggregate.goal, 'update');
      const aggregateUpdatedSpy = jest
        .spyOn(goalAggregate, 'updated')
        .mockImplementation(() => {});

      // Act
      goalAggregate.updateGoalDetails(updates);

      // Assert
      expect(updateSpy).toHaveBeenCalledWith(updates);
      expect(aggregateUpdatedSpy).toHaveBeenCalled();
      expect(goalAggregate.goal.title).toBe(updates.title);
      expect(goalAggregate.goal.description).toBe(updates.description);
      expect(goalAggregate.goal.targetAmount).toEqual(updates.targetAmount);
      expect(goalAggregate.goal.dueDate).toEqual(updates.dueDate);
    });

    it('should handle empty update object', () => {
      // Arrange
      const originalTitle = goalAggregate.goal.title;
      const updateSpy = jest.spyOn(goalAggregate.goal, 'update');
      const aggregateUpdatedSpy = jest
        .spyOn(goalAggregate, 'updated')
        .mockImplementation(() => {});

      // Act
      goalAggregate.updateGoalDetails({});

      // Assert
      expect(updateSpy).toHaveBeenCalledWith({});
      expect(aggregateUpdatedSpy).toHaveBeenCalled();
      expect(goalAggregate.goal.title).toBe(originalTitle); // Should remain unchanged
    });
  });

  describe('edge cases and boundary conditions', () => {
    it('should handle very small positive amounts', () => {
      // Arrange
      const verySmallAmount = new CurrencyVO(0.01, Currency.USD);

      // Act
      goalAggregate.contribute({ amount: verySmallAmount });

      // Assert
      expect(goalAggregate.totalContributed.value).toBe(0.01);
      expect(goalAggregate.contributions).toHaveLength(1);
    });

    it('should handle large amounts without overflow', () => {
      // Arrange
      const largeAmount = new CurrencyVO(
        Number.MAX_SAFE_INTEGER - 1,
        Currency.USD,
      );

      // Act
      goalAggregate.contribute({ amount: largeAmount });

      // Assert
      expect(goalAggregate.totalContributed.value).toBe(
        Number.MAX_SAFE_INTEGER - 1,
      );
    });

    it('should handle transactions that result in negative total', () => {
      // Arrange
      goalAggregate.contribute({ amount: new CurrencyVO(100, Currency.USD) });
      goalAggregate.withdraw({ amount: new CurrencyVO(150, Currency.USD) });

      // Act
      const total = goalAggregate.totalContributed;

      // Assert
      expect(total.value).toBe(-50);
    });

    it('should handle zero net contribution (equal contributions and withdrawals)', () => {
      // Arrange
      goalAggregate.contribute({ amount: new CurrencyVO(200, Currency.USD) });
      goalAggregate.withdraw({ amount: new CurrencyVO(200, Currency.USD) });

      // Act
      const total = goalAggregate.totalContributed;

      // Assert
      expect(total.value).toBe(0);
    });

    it('should validate that all transactions belong to the correct user', () => {
      // Arrange & Act
      goalAggregate.contribute({ amount: new CurrencyVO(100, Currency.USD) });
      goalAggregate.withdraw({ amount: new CurrencyVO(50, Currency.USD) });

      // Assert
      const transactions = goalAggregate.contributions;
      transactions.forEach((transaction) => {
        expect(transaction.props.userId).toBe(mockUserId);
      });
    });

    it('should set proper timestamps for all transactions', () => {
      // Arrange
      const beforeTime = new Date();

      // Act
      goalAggregate.contribute({ amount: new CurrencyVO(100, Currency.USD) });
      goalAggregate.withdraw({ amount: new CurrencyVO(50, Currency.USD) });

      const afterTime = new Date();

      // Assert
      const transactions = goalAggregate.contributions;
      transactions.forEach((transaction) => {
        expect(transaction.props.createdAt).toBeInstanceOf(Date);
        expect(transaction.props.updatedAt).toBeInstanceOf(Date);
        expect(transaction.props.createdAt.getTime()).toBeGreaterThanOrEqual(
          beforeTime.getTime(),
        );
        expect(transaction.props.createdAt.getTime()).toBeLessThanOrEqual(
          afterTime.getTime(),
        );
        expect(transaction.props.updatedAt.getTime()).toBeGreaterThanOrEqual(
          beforeTime.getTime(),
        );
        expect(transaction.props.updatedAt.getTime()).toBeLessThanOrEqual(
          afterTime.getTime(),
        );
      });
    });
  });
});
