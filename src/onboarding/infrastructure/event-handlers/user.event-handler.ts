import { UserEvent, UserSignedUpEventPayload } from '@/common/events';
import { UserEventHandler } from '@/onboarding/domain';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class UserEventHandlerImpl implements UserEventHandler {
  @OnEvent(UserEvent.USER_SIGNED_UP)
  createOnboardingProfile(payload: UserSignedUpEventPayload): void {
    console.log('Creating onboarding profile for user', payload.userId);
  }
}
