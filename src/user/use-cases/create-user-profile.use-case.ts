import { BaseUseCase } from '@/common/base/use-case/base.use-case';
import { Currency, Language } from '@/common/types/user';
import { Injectable } from '@nestjs/common';
import { CreateUserProfileDto } from '../controllers/dto/create-user-profile.dto';
import { UserEntity } from '../domain/entities/user.entity';
import { UserErrorFactory } from '../domain/errors';
import { UserRepository } from '../domain/repositories/user.repository';

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
      throw UserErrorFactory.userProfileAlreadyExists();
    }

    // Create new user profile with defaults
    const userEntity = UserEntity.create({
      name: profileData.name,
      userId: userId,
      financialStage: profileData.financialStage || null,
      currency: profileData.currency || Currency.VND,
      language: profileData.language || Language.VI,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Save to database
    return await this.userRepository.create(userEntity);
  }
}
