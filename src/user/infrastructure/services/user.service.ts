import { UserEvent, UserSignedUpEventPayload } from '@/common/events';
import { UserService } from '@/user/domain';
import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class UserServiceImpl implements UserService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  handleUserSignedUp(userId: string): void {
    console.log('SEND User signed up', userId);
    this.eventEmitter.emit(UserEvent.USER_SIGNED_UP, { userId });
  }

  @OnEvent(UserEvent.USER_SIGNED_UP)
  handleUserSignedUpEvent(payload: UserSignedUpEventPayload) {
    console.log('User signed up', payload);
  }
}
