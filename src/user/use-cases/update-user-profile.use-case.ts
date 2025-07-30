import { Injectable, NotFoundException } from '@nestjs/common';
import { BaseUseCase } from '@/common/use-case/base.use-case';
import { UserEntity } from '../domain/entities/user.entity';
import { UserRepository } from '../domain/repositories/user.repository';
import { UpdateUserProfileDto } from '../controllers/dto/update-user-profile.dto';

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
      throw new NotFoundException('User not found');
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
