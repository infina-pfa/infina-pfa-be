import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { CommonErrorCode } from './common-error-codes';

export class CommonErrorFactory {
  static currencyMismatch(): BadRequestException {
    return new BadRequestException({
      code: CommonErrorCode.CURRENCY_MISMATCH,
      message: 'Currencies must match',
    });
  }

  static unauthorizedNoToken(): UnauthorizedException {
    return new UnauthorizedException({
      code: CommonErrorCode.UNAUTHORIZED_NO_TOKEN,
      message: 'No token provided',
    });
  }

  static unauthorizedInvalidToken(): UnauthorizedException {
    return new UnauthorizedException({
      code: CommonErrorCode.UNAUTHORIZED_INVALID_TOKEN,
      message: 'Invalid token',
    });
  }
}
