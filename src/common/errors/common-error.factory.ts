import {
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
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

  static invalidFileType(message: string): BadRequestException {
    return new BadRequestException({
      code: CommonErrorCode.INVALID_FILE_TYPE,
      message,
    });
  }

  static fileSizeExceedsLimit(message: string): BadRequestException {
    return new BadRequestException({
      code: CommonErrorCode.FILE_SIZE_EXCEEDS_LIMIT,
      message,
    });
  }

  static internalServerError(message: string): InternalServerErrorException {
    return new InternalServerErrorException({
      code: CommonErrorCode.INTERNAL_SERVER_ERROR,
      message,
    });
  }
}
