import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { SignInUseCase, SignUpUseCase } from './use-cases';
import { UserRepository } from './domain';
import { UserSupabaseRepository } from './infrastructure';
import { SupabaseModule } from '@/common';

@Module({
  imports: [SupabaseModule],
  controllers: [AuthController],
  providers: [
    SignInUseCase,
    SignUpUseCase,
    {
      provide: UserRepository,
      useClass: UserSupabaseRepository,
    },
  ],
  exports: [SignInUseCase, SignUpUseCase, UserRepository],
})
export class AuthModule {}