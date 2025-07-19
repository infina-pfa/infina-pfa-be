import { Injectable } from '@nestjs/common';
import { UserEntity, UserRepository, Email, Password } from '@/user/domain';

export type SignUpUseCaseInput = {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
};

export type SignUpUseCaseOutput = {
  user: UserEntity;
};

@Injectable()
export class SignUpUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: SignUpUseCaseInput): Promise<SignUpUseCaseOutput> {
    const email = Email.create(input.email);

    const emailExists = await this.userRepository.existsByEmail(email.value);
    if (emailExists) {
      throw new Error('User with this email already exists');
    }

    const password = await Password.createFromPlainText(input.password);

    const user = UserEntity.create({
      email: email.value,
      passwordHash: password.getHash(),
      firstName: input.firstName,
      lastName: input.lastName,
    });

    const savedUser = await this.userRepository.create(user);

    return { user: savedUser };
  }
}
