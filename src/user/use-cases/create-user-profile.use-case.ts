import { Injectable, ConflictException } from '@nestjs/common';
import { BaseUseCase } from '@/common/use-case/base.use-case';
import { UserEntity } from '../domain/entities/user.entity';
import { UserRepository } from '../domain/repositories/user.repository';
import { CreateUserProfileDto } from '../controllers/dto/create-user-profile.dto';
import { Currency, Language } from '@/common/types/user';

export interface CreateUserProfileInput {
  userId: string;
  profileData: CreateUserProfileDto;
}

@Injectable()
export class CreateUserProfileUseCase extends BaseUseCase<
  CreateUserProfileInput,
  UserEntity
> {
  constructor(private readonly userRepository: UserRepository) {
    super();
  }

  async execute(input: CreateUserProfileInput): Promise<UserEntity> {
    const { userId, profileData } = input;

    // Check if user profile already exists
    const existingUser = await this.userRepository.findOne({ userId });
    if (existingUser) {
      throw new ConflictException('User profile already exists');
    }

    // Create new user profile with defaults
    const userEntity = UserEntity.create({
      name: profileData.name,
      userId: userId,
      financialStage: profileData.financialStage || null,
      onboardingCompletedAt: null, // Initially not completed
      currency: profileData.currency || Currency.VND,
      language: profileData.language || Language.VI,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Save to database
    return await this.userRepository.create(userEntity);
  }
}
