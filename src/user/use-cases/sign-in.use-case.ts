import { Injectable } from '@nestjs/common';
import { UserEntity, UserRepository, Email, Password } from '@/user/domain';

export type SignInUseCaseInput = {
  email: string;
  password: string;
};

export type SignInUseCaseOutput = {
  user: UserEntity;
  accessToken: string;
};

@Injectable()
export class SignInUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: SignInUseCaseInput): Promise<SignInUseCaseOutput> {
    const email = Email.create(input.email);

    const user = await this.userRepository.findByEmail(email.value);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (!user.isActive()) {
      throw new Error('Account is not active');
    }

    const password = Password.createFromHash(user.passwordHash);
    const isPasswordValid = await password.compare(input.password);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    user.updateLastSignIn();
    await this.userRepository.update(user);

    // TODO: Generate JWT token using a proper JWT service
    const accessToken = `mock_token_${user.id}`;

    return {
      user,
      accessToken,
    };
  }
}
