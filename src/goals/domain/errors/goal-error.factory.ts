import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { GoalErrorCode } from './goal-error-codes';

export class GoalErrorFactory {
  static invalidGoal(message: string): BadRequestException {
    return new BadRequestException({
      code: GoalErrorCode.INVALID_GOAL,
      message,
    });
  }

  static goalNotFound(): NotFoundException {
    return new NotFoundException({
      code: GoalErrorCode.GOAL_NOT_FOUND,
      message: 'Goal not found',
    });
  }

  static goalInvalidTargetAmount(): BadRequestException {
    return new BadRequestException({
      code: GoalErrorCode.GOAL_INVALID_TARGET_AMOUNT,
      message: 'Target amount must be greater than 0',
    });
  }

  static goalInvalidDueDate(): BadRequestException {
    return new BadRequestException({
      code: GoalErrorCode.GOAL_INVALID_DUE_DATE,
      message: 'Due date must be in the future',
    });
  }

  static goalTitleAlreadyExists(title: string): ConflictException {
    return new ConflictException({
      code: GoalErrorCode.GOAL_TITLE_ALREADY_EXISTS,
      message: `Goal with title '${title}' already exists for this user`,
    });
  }

  static goalInsufficientBalance(
    requestedAmount: number,
    availableBalance: number,
  ): BadRequestException {
    return new BadRequestException({
      code: GoalErrorCode.GOAL_INSUFFICIENT_BALANCE,
      message: `Insufficient balance. Requested ${requestedAmount}, but only ${availableBalance} available`,
    });
  }
}
