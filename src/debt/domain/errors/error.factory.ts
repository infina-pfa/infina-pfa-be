import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { DebtErrorCodes } from './error.code';

export class DebtErrorFactory {
  static debtNotFound(): NotFoundException {
    return new NotFoundException({
      code: DebtErrorCodes.DEBT_NOT_FOUND,
      message: 'Debt not found',
    });
  }

  static forbiddenDebt(): ForbiddenException {
    return new ForbiddenException({
      code: DebtErrorCodes.FORBIDDEN_DEBT,
      message: 'Forbidden to pay debt',
    });
  }
}
