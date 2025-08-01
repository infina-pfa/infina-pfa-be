import { ConflictException, NotFoundException } from '@nestjs/common';
import { UserErrorCode } from './user-error-codes';

export class UserErrorFactory {
  static userProfileNotFound(): NotFoundException {
    return new NotFoundException({
      code: UserErrorCode.USER_PROFILE_NOT_FOUND,
      message: 'User profile not found',
    });
  }

  static userProfileAlreadyExists(): ConflictException {
    return new ConflictException({
      code: UserErrorCode.USER_PROFILE_ALREADY_EXISTS,
      message: 'User profile already exists',
    });
  }
}
