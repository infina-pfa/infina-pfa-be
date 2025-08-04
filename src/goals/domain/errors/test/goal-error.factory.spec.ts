import {
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { GoalErrorFactory } from '../goal-error.factory';
import { GoalErrorCode } from '../goal-error-codes';

describe('GoalErrorFactory', () => {
  describe('invalidGoal', () => {
    it('should create BadRequestException with INVALID_GOAL code', () => {
      // Arrange
      const message = 'Goal validation failed';

      // Act
      const error = GoalErrorFactory.invalidGoal(message);

      // Assert
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.getResponse()).toEqual({
        code: GoalErrorCode.INVALID_GOAL,
        message,
      });
    });

    it('should handle empty message', () => {
      // Arrange
      const message = '';

      // Act
      const error = GoalErrorFactory.invalidGoal(message);

      // Assert
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.getResponse()).toEqual({
        code: GoalErrorCode.INVALID_GOAL,
        message: '',
      });
    });

    it('should handle long message', () => {
      // Arrange
      const longMessage = 'A'.repeat(1000);

      // Act
      const error = GoalErrorFactory.invalidGoal(longMessage);

      // Assert
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.getResponse()).toEqual({
        code: GoalErrorCode.INVALID_GOAL,
        message: longMessage,
      });
    });
  });

  describe('goalNotFound', () => {
    it('should create NotFoundException with GOAL_NOT_FOUND code', () => {
      // Act
      const error = GoalErrorFactory.goalNotFound();

      // Assert
      expect(error).toBeInstanceOf(NotFoundException);
      expect(error.getResponse()).toEqual({
        code: GoalErrorCode.GOAL_NOT_FOUND,
        message: 'Goal not found',
      });
    });
  });

  describe('goalInvalidTargetAmount', () => {
    it('should create BadRequestException with GOAL_INVALID_TARGET_AMOUNT code', () => {
      // Act
      const error = GoalErrorFactory.goalInvalidTargetAmount();

      // Assert
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.getResponse()).toEqual({
        code: GoalErrorCode.GOAL_INVALID_TARGET_AMOUNT,
        message: 'Target amount must be greater than 0',
      });
    });
  });

  describe('goalInvalidDueDate', () => {
    it('should create BadRequestException with GOAL_INVALID_DUE_DATE code', () => {
      // Act
      const error = GoalErrorFactory.goalInvalidDueDate();

      // Assert
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.getResponse()).toEqual({
        code: GoalErrorCode.GOAL_INVALID_DUE_DATE,
        message: 'Due date must be in the future',
      });
    });
  });

  describe('goalTitleAlreadyExists', () => {
    it('should create ConflictException with GOAL_TITLE_ALREADY_EXISTS code', () => {
      // Arrange
      const title = 'Save for vacation';

      // Act
      const error = GoalErrorFactory.goalTitleAlreadyExists(title);

      // Assert
      expect(error).toBeInstanceOf(ConflictException);
      expect(error.getResponse()).toEqual({
        code: GoalErrorCode.GOAL_TITLE_ALREADY_EXISTS,
        message: `Goal with title '${title}' already exists for this user`,
      });
    });

    it('should handle empty title', () => {
      // Arrange
      const title = '';

      // Act
      const error = GoalErrorFactory.goalTitleAlreadyExists(title);

      // Assert
      expect(error).toBeInstanceOf(ConflictException);
      expect(error.getResponse()).toEqual({
        code: GoalErrorCode.GOAL_TITLE_ALREADY_EXISTS,
        message: `Goal with title '' already exists for this user`,
      });
    });

    it('should handle title with special characters', () => {
      // Arrange
      const title = 'Save for "vacation" & travel (2025)';

      // Act
      const error = GoalErrorFactory.goalTitleAlreadyExists(title);

      // Assert
      expect(error).toBeInstanceOf(ConflictException);
      expect(error.getResponse()).toEqual({
        code: GoalErrorCode.GOAL_TITLE_ALREADY_EXISTS,
        message: `Goal with title '${title}' already exists for this user`,
      });
    });

    it('should handle very long title', () => {
      // Arrange
      const longTitle = 'A'.repeat(500);

      // Act
      const error = GoalErrorFactory.goalTitleAlreadyExists(longTitle);

      // Assert
      expect(error).toBeInstanceOf(ConflictException);
      expect(error.getResponse()).toEqual({
        code: GoalErrorCode.GOAL_TITLE_ALREADY_EXISTS,
        message: `Goal with title '${longTitle}' already exists for this user`,
      });
    });
  });

  describe('goalInsufficientBalance', () => {
    it('should create BadRequestException with GOAL_INSUFFICIENT_BALANCE code for integer amounts', () => {
      // Arrange
      const requestedAmount = 150;
      const availableBalance = 100;

      // Act
      const error = GoalErrorFactory.goalInsufficientBalance(
        requestedAmount,
        availableBalance,
      );

      // Assert
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.getResponse()).toEqual({
        code: GoalErrorCode.GOAL_INSUFFICIENT_BALANCE,
        message: `Insufficient balance. Requested ${requestedAmount}, but only ${availableBalance} available`,
      });
    });

    it('should create BadRequestException with GOAL_INSUFFICIENT_BALANCE code for decimal amounts', () => {
      // Arrange
      const requestedAmount = 150.75;
      const availableBalance = 100.25;

      // Act
      const error = GoalErrorFactory.goalInsufficientBalance(
        requestedAmount,
        availableBalance,
      );

      // Assert
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.getResponse()).toEqual({
        code: GoalErrorCode.GOAL_INSUFFICIENT_BALANCE,
        message: `Insufficient balance. Requested ${requestedAmount}, but only ${availableBalance} available`,
      });
    });

    it('should handle zero available balance', () => {
      // Arrange
      const requestedAmount = 50;
      const availableBalance = 0;

      // Act
      const error = GoalErrorFactory.goalInsufficientBalance(
        requestedAmount,
        availableBalance,
      );

      // Assert
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.getResponse()).toEqual({
        code: GoalErrorCode.GOAL_INSUFFICIENT_BALANCE,
        message: `Insufficient balance. Requested ${requestedAmount}, but only ${availableBalance} available`,
      });
    });

    it('should handle very small requested amount with zero balance', () => {
      // Arrange
      const requestedAmount = 0.01;
      const availableBalance = 0;

      // Act
      const error = GoalErrorFactory.goalInsufficientBalance(
        requestedAmount,
        availableBalance,
      );

      // Assert
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.getResponse()).toEqual({
        code: GoalErrorCode.GOAL_INSUFFICIENT_BALANCE,
        message: `Insufficient balance. Requested ${requestedAmount}, but only ${availableBalance} available`,
      });
    });

    it('should handle very small difference between requested and available amounts', () => {
      // Arrange
      const requestedAmount = 100.01;
      const availableBalance = 100.0;

      // Act
      const error = GoalErrorFactory.goalInsufficientBalance(
        requestedAmount,
        availableBalance,
      );

      // Assert
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.getResponse()).toEqual({
        code: GoalErrorCode.GOAL_INSUFFICIENT_BALANCE,
        message: `Insufficient balance. Requested ${requestedAmount}, but only ${availableBalance} available`,
      });
    });

    it('should handle large amounts', () => {
      // Arrange
      const requestedAmount = 999999.99;
      const availableBalance = 999999.98;

      // Act
      const error = GoalErrorFactory.goalInsufficientBalance(
        requestedAmount,
        availableBalance,
      );

      // Assert
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.getResponse()).toEqual({
        code: GoalErrorCode.GOAL_INSUFFICIENT_BALANCE,
        message: `Insufficient balance. Requested ${requestedAmount}, but only ${availableBalance} available`,
      });
    });

    it('should handle negative requested amount (edge case)', () => {
      // Arrange - This shouldn't happen in practice, but test defensive behavior
      const requestedAmount = -50;
      const availableBalance = 100;

      // Act
      const error = GoalErrorFactory.goalInsufficientBalance(
        requestedAmount,
        availableBalance,
      );

      // Assert
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.getResponse()).toEqual({
        code: GoalErrorCode.GOAL_INSUFFICIENT_BALANCE,
        message: `Insufficient balance. Requested ${requestedAmount}, but only ${availableBalance} available`,
      });
    });

    it('should handle negative available balance (edge case)', () => {
      // Arrange - This shouldn't happen in practice, but test defensive behavior
      const requestedAmount = 50;
      const availableBalance = -10;

      // Act
      const error = GoalErrorFactory.goalInsufficientBalance(
        requestedAmount,
        availableBalance,
      );

      // Assert
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.getResponse()).toEqual({
        code: GoalErrorCode.GOAL_INSUFFICIENT_BALANCE,
        message: `Insufficient balance. Requested ${requestedAmount}, but only ${availableBalance} available`,
      });
    });

    it('should handle zero requested amount (edge case)', () => {
      // Arrange - This shouldn't happen in practice, but test defensive behavior
      const requestedAmount = 0;
      const availableBalance = 100;

      // Act
      const error = GoalErrorFactory.goalInsufficientBalance(
        requestedAmount,
        availableBalance,
      );

      // Assert
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.getResponse()).toEqual({
        code: GoalErrorCode.GOAL_INSUFFICIENT_BALANCE,
        message: `Insufficient balance. Requested ${requestedAmount}, but only ${availableBalance} available`,
      });
    });

    it('should handle very precise decimal amounts', () => {
      // Arrange
      const requestedAmount = 123.456789;
      const availableBalance = 123.456788;

      // Act
      const error = GoalErrorFactory.goalInsufficientBalance(
        requestedAmount,
        availableBalance,
      );

      // Assert
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.getResponse()).toEqual({
        code: GoalErrorCode.GOAL_INSUFFICIENT_BALANCE,
        message: `Insufficient balance. Requested ${requestedAmount}, but only ${availableBalance} available`,
      });
    });

    it('should handle maximum safe integer amounts', () => {
      // Arrange
      const requestedAmount = Number.MAX_SAFE_INTEGER;
      const availableBalance = Number.MAX_SAFE_INTEGER - 1;

      // Act
      const error = GoalErrorFactory.goalInsufficientBalance(
        requestedAmount,
        availableBalance,
      );

      // Assert
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.getResponse()).toEqual({
        code: GoalErrorCode.GOAL_INSUFFICIENT_BALANCE,
        message: `Insufficient balance. Requested ${requestedAmount}, but only ${availableBalance} available`,
      });
    });
  });

  describe('error code verification', () => {
    it('should use correct error codes for all factory methods', () => {
      // Assert all error codes are correctly assigned
      expect(GoalErrorFactory.invalidGoal('test').getResponse()).toEqual(
        expect.objectContaining({ code: GoalErrorCode.INVALID_GOAL }),
      );

      expect(GoalErrorFactory.goalNotFound().getResponse()).toEqual(
        expect.objectContaining({ code: GoalErrorCode.GOAL_NOT_FOUND }),
      );

      expect(GoalErrorFactory.goalInvalidTargetAmount().getResponse()).toEqual(
        expect.objectContaining({
          code: GoalErrorCode.GOAL_INVALID_TARGET_AMOUNT,
        }),
      );

      expect(GoalErrorFactory.goalInvalidDueDate().getResponse()).toEqual(
        expect.objectContaining({ code: GoalErrorCode.GOAL_INVALID_DUE_DATE }),
      );

      expect(
        GoalErrorFactory.goalTitleAlreadyExists('test').getResponse(),
      ).toEqual(
        expect.objectContaining({
          code: GoalErrorCode.GOAL_TITLE_ALREADY_EXISTS,
        }),
      );

      expect(
        GoalErrorFactory.goalInsufficientBalance(100, 50).getResponse(),
      ).toEqual(
        expect.objectContaining({
          code: GoalErrorCode.GOAL_INSUFFICIENT_BALANCE,
        }),
      );
    });
  });

  describe('error instanceof verification', () => {
    it('should return correct exception types', () => {
      // Arrange & Act & Assert
      expect(GoalErrorFactory.invalidGoal('test')).toBeInstanceOf(
        BadRequestException,
      );
      expect(GoalErrorFactory.goalNotFound()).toBeInstanceOf(NotFoundException);
      expect(GoalErrorFactory.goalInvalidTargetAmount()).toBeInstanceOf(
        BadRequestException,
      );
      expect(GoalErrorFactory.goalInvalidDueDate()).toBeInstanceOf(
        BadRequestException,
      );
      expect(GoalErrorFactory.goalTitleAlreadyExists('test')).toBeInstanceOf(
        ConflictException,
      );
      expect(GoalErrorFactory.goalInsufficientBalance(100, 50)).toBeInstanceOf(
        BadRequestException,
      );
    });
  });
});
