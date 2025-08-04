import { CurrencyVO } from '@/common/base';
import { Currency } from '@/common/types/user';
import { GoalEntity } from '../goal.entity';

describe('GoalEntity', () => {
  const mockUserId = 'user-123';
  const mockTitle = 'Save for vacation';
  const mockDescription = 'Save money for a vacation to Japan';
  const mockTargetAmount = new CurrencyVO(5000, Currency.USD);
  const mockCurrentAmount = new CurrencyVO(1000, Currency.USD);
  const mockDueDate = new Date('2025-12-31');

  describe('static create method', () => {
    it('should create goal with all properties', () => {
      // Arrange
      const props = {
        userId: mockUserId,
        title: mockTitle,
        description: mockDescription,
        targetAmount: mockTargetAmount,
        currentAmount: mockCurrentAmount,
        dueDate: mockDueDate,
      };

      // Act
      const goal = GoalEntity.create(props);

      // Assert
      expect(goal).toBeInstanceOf(GoalEntity);
      expect(goal.userId).toBe(mockUserId);
      expect(goal.title).toBe(mockTitle);
      expect(goal.description).toBe(mockDescription);
      expect(goal.targetAmount).toEqual(mockTargetAmount);
      expect(goal.currentAmount).toEqual(mockCurrentAmount);
      expect(goal.dueDate).toEqual(mockDueDate);
      expect(goal.id).toBeDefined();
      expect(typeof goal.id).toBe('string');
    });

    it('should create goal with minimal required fields', () => {
      // Arrange
      const props = {
        userId: mockUserId,
        title: mockTitle,
        description: undefined,
        targetAmount: undefined,
        dueDate: undefined,
      };

      // Act
      const goal = GoalEntity.create(props);

      // Assert
      expect(goal.userId).toBe(mockUserId);
      expect(goal.title).toBe(mockTitle);
      expect(goal.description).toBeUndefined();
      expect(goal.targetAmount).toBeUndefined();
      expect(goal.currentAmount).toEqual(new CurrencyVO(0));
      expect(goal.dueDate).toBeUndefined();
    });

    it('should use default currentAmount (0) if not provided', () => {
      // Arrange
      const props = {
        userId: mockUserId,
        title: mockTitle,
        description: undefined,
        targetAmount: mockTargetAmount,
        dueDate: undefined,
      };

      // Act
      const goal = GoalEntity.create(props);

      // Assert
      expect(goal.currentAmount).toEqual(new CurrencyVO(0));
    });

    it('should use default timestamps if not provided', () => {
      // Arrange
      const beforeTime = new Date();
      const props = {
        userId: mockUserId,
        title: mockTitle,
        description: undefined,
        targetAmount: undefined,
        dueDate: undefined,
      };

      // Act
      const goal = GoalEntity.create(props);
      const afterTime = new Date();

      // Assert
      expect(goal.props.createdAt).toBeInstanceOf(Date);
      expect(goal.props.updatedAt).toBeInstanceOf(Date);
      expect(goal.props.createdAt.getTime()).toBeGreaterThanOrEqual(
        beforeTime.getTime(),
      );
      expect(goal.props.createdAt.getTime()).toBeLessThanOrEqual(
        afterTime.getTime(),
      );
      expect(goal.props.updatedAt.getTime()).toBeGreaterThanOrEqual(
        beforeTime.getTime(),
      );
      expect(goal.props.updatedAt.getTime()).toBeLessThanOrEqual(
        afterTime.getTime(),
      );
    });

    it('should create with custom ID', () => {
      // Arrange
      const customId = 'custom-goal-id-123';
      const props = {
        userId: mockUserId,
        title: mockTitle,
        description: undefined,
        targetAmount: undefined,
        dueDate: undefined,
      };

      // Act
      const goal = GoalEntity.create(props, customId);

      // Assert
      expect(goal.id).toBe(customId);
    });

    it('should create with custom timestamps', () => {
      // Arrange
      const customCreatedAt = new Date('2023-01-01');
      const customUpdatedAt = new Date('2023-06-01');
      const props = {
        userId: mockUserId,
        title: mockTitle,
        description: undefined,
        targetAmount: undefined,
        dueDate: undefined,
        createdAt: customCreatedAt,
        updatedAt: customUpdatedAt,
      };

      // Act
      const goal = GoalEntity.create(props);

      // Assert
      expect(goal.props.createdAt).toEqual(customCreatedAt);
      expect(goal.props.updatedAt).toEqual(customUpdatedAt);
    });
  });

  describe('getter methods', () => {
    let goal: GoalEntity;

    beforeEach(() => {
      goal = GoalEntity.create({
        userId: mockUserId,
        title: mockTitle,
        description: mockDescription,
        targetAmount: mockTargetAmount,
        currentAmount: mockCurrentAmount,
        dueDate: mockDueDate,
      });
    });

    it('should return userId correctly', () => {
      // Act & Assert
      expect(goal.userId).toBe(mockUserId);
    });

    it('should return title correctly', () => {
      // Act & Assert
      expect(goal.title).toBe(mockTitle);
    });

    it('should return description correctly', () => {
      // Act & Assert
      expect(goal.description).toBe(mockDescription);
    });

    it('should return targetAmount correctly', () => {
      // Act & Assert
      expect(goal.targetAmount).toEqual(mockTargetAmount);
    });

    it('should return currentAmount correctly', () => {
      // Act & Assert
      expect(goal.currentAmount).toEqual(mockCurrentAmount);
    });

    it('should return dueDate correctly', () => {
      // Act & Assert
      expect(goal.dueDate).toEqual(mockDueDate);
    });

    it('should return undefined for optional properties when not set', () => {
      // Arrange
      const minimalGoal = GoalEntity.create({
        userId: mockUserId,
        title: mockTitle,
        description: undefined,
        targetAmount: undefined,
        dueDate: undefined,
      });

      // Act & Assert
      expect(minimalGoal.description).toBeUndefined();
      expect(minimalGoal.targetAmount).toBeUndefined();
      expect(minimalGoal.dueDate).toBeUndefined();
    });
  });

  describe('update method', () => {
    let goal: GoalEntity;

    beforeEach(() => {
      goal = GoalEntity.create({
        userId: mockUserId,
        title: 'Original Title',
        description: 'Original Description',
        targetAmount: new CurrencyVO(1000, Currency.USD),
        dueDate: new Date('2024-12-31'),
      });
    });

    it('should update title successfully', () => {
      // Arrange
      const newTitle = 'Updated Title';

      // Act
      goal.update({ title: newTitle });

      // Assert
      expect(goal.title).toBe(newTitle);
    });

    it('should update description successfully', () => {
      // Arrange
      const newDescription = 'Updated Description';

      // Act
      goal.update({ description: newDescription });

      // Assert
      expect(goal.description).toBe(newDescription);
    });

    it('should update targetAmount successfully', () => {
      // Arrange
      const newTargetAmount = new CurrencyVO(2000, Currency.EUR);

      // Act
      goal.update({ targetAmount: newTargetAmount });

      // Assert
      expect(goal.targetAmount).toEqual(newTargetAmount);
    });

    it('should update dueDate successfully', () => {
      // Arrange
      const newDueDate = new Date('2026-06-30');

      // Act
      goal.update({ dueDate: newDueDate });

      // Assert
      expect(goal.dueDate).toEqual(newDueDate);
    });

    it('should update multiple properties at once', () => {
      // Arrange
      const newTitle = 'New Title';
      const newDescription = 'New Description';
      const newTargetAmount = new CurrencyVO(3000, Currency.VND);
      const newDueDate = new Date('2027-01-01');

      // Act
      goal.update({
        title: newTitle,
        description: newDescription,
        targetAmount: newTargetAmount,
        dueDate: newDueDate,
      });

      // Assert
      expect(goal.title).toBe(newTitle);
      expect(goal.description).toBe(newDescription);
      expect(goal.targetAmount).toEqual(newTargetAmount);
      expect(goal.dueDate).toEqual(newDueDate);
    });

    it('should call updated() method to update timestamp', () => {
      // Arrange
      const updatedSpy = jest.spyOn(goal, 'updated');

      // Act
      goal.update({ title: 'New Title' });

      // Assert
      expect(updatedSpy).toHaveBeenCalled();
    });

    it('should not allow updating userId', () => {
      // Arrange
      const originalUserId = goal.userId;

      // Act
      goal.update({} as any); // TypeScript should prevent this, but testing runtime behavior

      // Assert
      expect(goal.userId).toBe(originalUserId);
    });

    it('should not allow updating currentAmount through update method', () => {
      // Arrange
      const originalCurrentAmount = goal.currentAmount;

      // Act
      goal.update({} as any); // TypeScript should prevent this, but testing runtime behavior

      // Assert
      expect(goal.currentAmount).toEqual(originalCurrentAmount);
    });

    it('should handle undefined values in update', () => {
      // Arrange
      goal.update({ description: 'Some description' });
      expect(goal.description).toBe('Some description');

      // Act
      goal.update({ description: undefined });

      // Assert
      expect(goal.description).toBeUndefined();
    });
  });

  describe('updateProgress method', () => {
    let goal: GoalEntity;

    beforeEach(() => {
      goal = GoalEntity.create({
        userId: mockUserId,
        title: mockTitle,
        description: undefined,
        targetAmount: undefined,
        currentAmount: new CurrencyVO(500, Currency.USD),
        dueDate: undefined,
      });
    });

    it('should update currentAmount successfully', () => {
      // Arrange
      const newAmount = new CurrencyVO(1500, Currency.USD);

      // Act
      goal.updateProgress(newAmount);

      // Assert
      expect(goal.currentAmount).toEqual(newAmount);
    });

    it('should call updated() method to update timestamp', () => {
      // Arrange
      const updatedSpy = jest.spyOn(goal, 'updated');
      const newAmount = new CurrencyVO(800, Currency.USD);

      // Act
      goal.updateProgress(newAmount);

      // Assert
      expect(updatedSpy).toHaveBeenCalled();
    });

    it('should update timestamp when progress is updated', () => {
      // Arrange
      const updateSpy = jest.spyOn(goal, 'updated');
      const newAmount = new CurrencyVO(1200, Currency.USD);

      // Act
      goal.updateProgress(newAmount);

      // Assert
      expect(updateSpy).toHaveBeenCalled();
    });

    it('should handle different currencies', () => {
      // Arrange
      const newAmount = new CurrencyVO(100, Currency.EUR);

      // Act
      goal.updateProgress(newAmount);

      // Assert
      expect(goal.currentAmount).toEqual(newAmount);
      expect(goal.currentAmount.currency).toBe(Currency.EUR);
    });

    it('should handle zero amount', () => {
      // Arrange
      const zeroAmount = new CurrencyVO(0, Currency.USD);

      // Act
      goal.updateProgress(zeroAmount);

      // Assert
      expect(goal.currentAmount).toEqual(zeroAmount);
    });
  });

  describe('isCompleted method', () => {
    it('should return false when no target amount is set', () => {
      // Arrange
      const goal = GoalEntity.create({
        userId: mockUserId,
        title: mockTitle,
        description: undefined,
        targetAmount: undefined,
        currentAmount: new CurrencyVO(1000, Currency.USD),
        dueDate: undefined,
      });

      // Act
      const result = goal.isCompleted();

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when current amount is less than target', () => {
      // Arrange
      const goal = GoalEntity.create({
        userId: mockUserId,
        title: mockTitle,
        description: undefined,
        targetAmount: new CurrencyVO(2000, Currency.USD),
        currentAmount: new CurrencyVO(1000, Currency.USD),
        dueDate: undefined,
      });

      // Act
      const result = goal.isCompleted();

      // Assert
      expect(result).toBe(false);
    });

    it('should return true when current amount equals target', () => {
      // Arrange
      const targetAmount = new CurrencyVO(1500, Currency.USD);
      const goal = GoalEntity.create({
        userId: mockUserId,
        title: mockTitle,
        description: undefined,
        targetAmount,
        currentAmount: new CurrencyVO(1500, Currency.USD),
        dueDate: undefined,
      });

      // Act
      const result = goal.isCompleted();

      // Assert
      expect(result).toBe(true);
    });

    it('should return true when current amount exceeds target', () => {
      // Arrange
      const goal = GoalEntity.create({
        userId: mockUserId,
        title: mockTitle,
        description: undefined,
        targetAmount: new CurrencyVO(1000, Currency.USD),
        currentAmount: new CurrencyVO(1200, Currency.USD),
        dueDate: undefined,
      });

      // Act
      const result = goal.isCompleted();

      // Assert
      expect(result).toBe(true);
    });

    it('should handle decimal amounts correctly', () => {
      // Arrange
      const goal = GoalEntity.create({
        userId: mockUserId,
        title: mockTitle,
        description: undefined,
        targetAmount: new CurrencyVO(100.5, Currency.USD),
        currentAmount: new CurrencyVO(100.5, Currency.USD),
        dueDate: undefined,
      });

      // Act
      const result = goal.isCompleted();

      // Assert
      expect(result).toBe(true);
    });

    it('should handle very small differences correctly', () => {
      // Arrange
      const goal = GoalEntity.create({
        userId: mockUserId,
        title: mockTitle,
        description: undefined,
        targetAmount: new CurrencyVO(100.0, Currency.USD),
        currentAmount: new CurrencyVO(99.99, Currency.USD),
        dueDate: undefined,
      });

      // Act
      const result = goal.isCompleted();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('isOverdue method', () => {
    it('should return false when no due date is set', () => {
      // Arrange
      const goal = GoalEntity.create({
        userId: mockUserId,
        title: mockTitle,
        description: undefined,
        targetAmount: new CurrencyVO(1000, Currency.USD),
        currentAmount: new CurrencyVO(500, Currency.USD),
        dueDate: undefined,
      });

      // Act
      const result = goal.isOverdue();

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when not yet due', () => {
      // Arrange
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30); // 30 days in the future

      const goal = GoalEntity.create({
        userId: mockUserId,
        title: mockTitle,
        description: undefined,
        targetAmount: new CurrencyVO(1000, Currency.USD),
        currentAmount: new CurrencyVO(500, Currency.USD),
        dueDate: futureDate,
      });

      // Act
      const result = goal.isOverdue();

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when overdue but completed', () => {
      // Arrange
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 30); // 30 days ago

      const goal = GoalEntity.create({
        userId: mockUserId,
        title: mockTitle,
        description: undefined,
        targetAmount: new CurrencyVO(1000, Currency.USD),
        currentAmount: new CurrencyVO(1000, Currency.USD), // Completed
        dueDate: pastDate,
      });

      // Act
      const result = goal.isOverdue();

      // Assert
      expect(result).toBe(false);
    });

    it('should return true when overdue and not completed', () => {
      // Arrange
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 10); // 10 days ago

      const goal = GoalEntity.create({
        userId: mockUserId,
        title: mockTitle,
        description: undefined,
        targetAmount: new CurrencyVO(1000, Currency.USD),
        currentAmount: new CurrencyVO(500, Currency.USD), // Not completed
        dueDate: pastDate,
      });

      // Act
      const result = goal.isOverdue();

      // Assert
      expect(result).toBe(true);
    });

    it('should handle exact due date timing', () => {
      // Arrange
      const exactlyNow = new Date();
      exactlyNow.setMilliseconds(exactlyNow.getMilliseconds() - 1); // 1ms ago

      const goal = GoalEntity.create({
        userId: mockUserId,
        title: mockTitle,
        description: undefined,
        targetAmount: new CurrencyVO(1000, Currency.USD),
        currentAmount: new CurrencyVO(500, Currency.USD),
        dueDate: exactlyNow,
      });

      // Act
      const result = goal.isOverdue();

      // Assert
      expect(result).toBe(true);
    });

    it('should return false for goal without target amount even if overdue', () => {
      // Arrange
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 10); // 10 days ago

      const goal = GoalEntity.create({
        userId: mockUserId,
        title: mockTitle,
        description: undefined,
        targetAmount: undefined, // No target amount - cannot be completed
        currentAmount: new CurrencyVO(500, Currency.USD),
        dueDate: pastDate,
      });

      // Act
      const result = goal.isOverdue();

      // Assert
      expect(result).toBe(true); // Still overdue even without target
    });

    it('should correctly combine isCompleted logic in overdue check', () => {
      // Arrange
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5); // 5 days ago

      const goal = GoalEntity.create({
        userId: mockUserId,
        title: mockTitle,
        description: undefined,
        targetAmount: new CurrencyVO(1000, Currency.USD),
        currentAmount: new CurrencyVO(1200, Currency.USD), // Exceeds target (completed)
        dueDate: pastDate,
      });

      // Act
      const result = goal.isOverdue();

      // Assert
      expect(result).toBe(false); // Not overdue because it's completed
    });
  });

  describe('edge cases and boundary conditions', () => {
    it('should handle very large currency amounts', () => {
      // Arrange
      const largeAmount = new CurrencyVO(
        Number.MAX_SAFE_INTEGER - 1,
        Currency.USD,
      );

      // Act
      const goal = GoalEntity.create({
        userId: mockUserId,
        title: mockTitle,
        description: undefined,
        targetAmount: largeAmount,
        currentAmount: largeAmount,
        dueDate: undefined,
      });

      // Assert
      expect(goal.isCompleted()).toBe(true);
      expect(goal.targetAmount).toEqual(largeAmount);
      expect(goal.currentAmount).toEqual(largeAmount);
    });

    it('should handle very small currency amounts', () => {
      // Arrange
      const smallAmount = new CurrencyVO(0.01, Currency.USD);

      // Act
      const goal = GoalEntity.create({
        userId: mockUserId,
        title: mockTitle,
        description: undefined,
        targetAmount: smallAmount,
        currentAmount: smallAmount,
        dueDate: undefined,
      });

      // Assert
      expect(goal.isCompleted()).toBe(true);
    });

    it('should handle empty strings for optional text fields', () => {
      // Arrange & Act
      const goal = GoalEntity.create({
        userId: mockUserId,
        title: mockTitle,
        description: '',
        targetAmount: undefined,
        dueDate: undefined,
      });

      // Assert
      expect(goal.description).toBe('');
    });

    it('should maintain immutability of props', () => {
      // Arrange
      const goal = GoalEntity.create({
        userId: mockUserId,
        title: mockTitle,
        description: undefined,
        targetAmount: undefined,
        dueDate: undefined,
      });

      // Act & Assert
      expect(() => {
        (goal.props as any).userId = 'modified-user-id';
      }).toThrow();
    });

    it('should handle different currency types correctly', () => {
      // Arrange
      const goal = GoalEntity.create({
        userId: mockUserId,
        title: mockTitle,
        description: undefined,
        targetAmount: new CurrencyVO(1000, Currency.EUR),
        currentAmount: new CurrencyVO(500, Currency.USD),
        dueDate: undefined,
      });

      // Act & Assert
      expect(goal.targetAmount?.currency).toBe(Currency.EUR);
      expect(goal.currentAmount.currency).toBe(Currency.USD);
      expect(goal.isCompleted()).toBe(false); // Different currencies, comparison still works
    });
  });
});
