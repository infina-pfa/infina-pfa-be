import { NotFoundException } from '@nestjs/common';
import { AiAdvisorErrorCode } from './error-code';

export class AiAdvisorErrorFactory {
  static onboardingProfileNotFound(): NotFoundException {
    return new NotFoundException({
      code: AiAdvisorErrorCode.ONBOARDING_PROFILE_NOT_FOUND,
      message: 'Onboarding profile not found',
    });
  }

  static userNotFound(): NotFoundException {
    return new NotFoundException({
      code: AiAdvisorErrorCode.USER_NOT_FOUND,
      message: 'User not found',
    });
  }

  static conversationNotFound(): NotFoundException {
    return new NotFoundException({
      code: AiAdvisorErrorCode.CONVERSATION_NOT_FOUND,
      message: 'Conversation not found',
    });
  }
}
