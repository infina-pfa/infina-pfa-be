import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { AppError } from '@/common/errors/base';
import { OnboardingErrorCode } from './onboarding-error-codes';

export class OnboardingErrorFactory {
  static profileNotFound(): NotFoundException {
    return new NotFoundException({
      code: OnboardingErrorCode.PROFILE_NOT_FOUND,
      message: 'Onboarding profile not found',
    });
  }

  static profileAlreadyExists(): ConflictException {
    return new ConflictException({
      code: OnboardingErrorCode.PROFILE_ALREADY_EXISTS,
      message: 'User already has an onboarding profile',
    });
  }

  static profileInvalidAmount(): AppError {
    return new AppError({
      code: OnboardingErrorCode.PROFILE_INVALID_AMOUNT,
      message: 'Financial amounts must be greater than or equal to 0',
    });
  }

  static profileAlreadyCompleted(): ConflictException {
    return new ConflictException({
      code: OnboardingErrorCode.PROFILE_ALREADY_COMPLETED,
      message: 'Onboarding profile is already completed',
    });
  }

  static messageNotFound(): NotFoundException {
    return new NotFoundException({
      code: OnboardingErrorCode.MESSAGE_NOT_FOUND,
      message: 'Onboarding message not found',
    });
  }

  static messageInvalidContent(): BadRequestException {
    return new BadRequestException({
      code: OnboardingErrorCode.MESSAGE_INVALID_CONTENT,
      message: 'Message content cannot be empty',
    });
  }

  static messageInvalidSender(): BadRequestException {
    return new BadRequestException({
      code: OnboardingErrorCode.MESSAGE_INVALID_SENDER,
      message: 'Invalid message sender',
    });
  }

  static invalidOnboarding(message: string): AppError {
    return new AppError({
      code: 'ONBOARDING_INVALID',
      message: message || 'Invalid onboarding data',
    });
  }

  static notFoundInformation(name: string): NotFoundException {
    return new NotFoundException({
      code: OnboardingErrorCode.PROFILE_NOT_FOUND_INFORMATION,
      message: `${name} not found`,
    });
  }
}
