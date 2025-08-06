import { UserEvent, UserSignedUpEventPayload } from '@/common/events';
import { Currency, Language } from '@/common/types';
import { UserEntity, UserRepository, UserService } from '@/user/domain';
import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class UserServiceImpl implements UserService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly userRepository: UserRepository,
  ) {}

  handleUserSignedUp(userId: string): void {
    console.log('SEND User signed up', userId);
    this.eventEmitter.emit(UserEvent.USER_SIGNED_UP, { userId });
  }

  @OnEvent(UserEvent.USER_SIGNED_UP)
  async handleUserSignedUpEvent(payload: UserSignedUpEventPayload) {
    const user = UserEntity.create({
      userId: payload.userId,
      name: payload.name,
      financialStage: null,
      currency: Currency.VND,
      language: Language.VI,
    });

    await this.userRepository.create(user);
  }
}
