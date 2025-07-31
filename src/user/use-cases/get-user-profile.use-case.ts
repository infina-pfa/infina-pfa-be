import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../domain/repositories/user.repository';
import { UserEntity } from '../domain/entities/user.entity';
import { BaseUseCase } from '@/common/base/use-case/base.use-case';

@Injectable()
export class GetUserProfileUseCase extends BaseUseCase<string, UserEntity> {
  constructor(private readonly userRepository: UserRepository) {
    super();
  }

  async execute(userId: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ userId });

    if (!user) {
      throw new NotFoundException('User profile not found');
    }

    return user;
  }
}
