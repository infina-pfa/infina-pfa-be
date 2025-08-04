import { BaseUseCase } from '@/common/base/use-case/base.use-case';
import { Injectable } from '@nestjs/common';
import { UpdateUserProfileDto } from '../controllers/dto/update-user-profile.dto';
import { UserEntity } from '../domain/entities/user.entity';
import { UserErrorFactory } from '../domain/errors';
import { UserRepository } from '../domain/repositories/user.repository';

export interface UpdateUserProfileInput {
  userId: string;
  updates: UpdateUserProfileDto;
}

@Injectable()
export class UpdateUserProfileUseCase extends BaseUseCase<
  UpdateUserProfileInput,
  UserEntity
> {
  constructor(private readonly userRepository: UserRepository) {
    super();
  }

  async execute(input: UpdateUserProfileInput): Promise<UserEntity> {
    const { userId, updates } = input;

    // Find the user
    const user = await this.userRepository.findOne({ userId });
    if (!user) {
      throw UserErrorFactory.userProfileNotFound();
    }

    // Handle null/undefined updates
    if (!updates) {
      return user;
    }

    // Update name if provided
    if (updates.name !== undefined) {
      user.updateName(updates.name);
    }

    // Update financial stage if provided
    if (updates.financialStage !== undefined) {
      user.setFinancialStage(updates.financialStage);
    }

    // Update currency if provided
    if (updates.currency !== undefined) {
      user.updateCurrency(updates.currency);
    }

    // Update language if provided
    if (updates.language !== undefined) {
      user.updateLanguage(updates.language);
    }

    // Save the updated user
    return await this.userRepository.update(user);
  }
}
