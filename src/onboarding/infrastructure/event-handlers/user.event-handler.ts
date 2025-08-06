import { UserEvent, UserSignedUpEventPayload } from '@/common/events';
import {
  OnboardingProfileEntity,
  OnboardingProfileRepository,
  UserEventHandler,
} from '@/onboarding/domain';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class UserEventHandlerImpl implements UserEventHandler {
  constructor(
    private readonly onboardingProfileRepository: OnboardingProfileRepository,
  ) {}

  @OnEvent(UserEvent.USER_SIGNED_UP)
  async createOnboardingProfile(
    payload: UserSignedUpEventPayload,
  ): Promise<void> {
    const profile = OnboardingProfileEntity.create({
      userId: payload.userId,
    });

    await this.onboardingProfileRepository.create(profile);
  }
}
