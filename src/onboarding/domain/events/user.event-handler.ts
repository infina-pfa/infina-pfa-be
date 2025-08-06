import { UserSignedUpEventPayload } from '@/common/events';

export abstract class UserEventHandler {
  abstract createOnboardingProfile(payload: UserSignedUpEventPayload): void;
}
