import { BaseUseCase } from '@/common/base/use-case/base.use-case';
import { Injectable } from '@nestjs/common';
import { UserEntity } from '../domain/entities/user.entity';
import { UserErrorFactory } from '../domain/errors';
import { UserRepository } from '../domain/repositories/user.repository';

@Injectable()
export class GetUserProfileUseCase extends BaseUseCase<string, UserEntity> {
  constructor(private readonly userRepository: UserRepository) {
    super();
  }

  async execute(userId: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ userId });

    if (!user) {
      throw UserErrorFactory.userProfileNotFound();
    }

    return user;
  }
}
