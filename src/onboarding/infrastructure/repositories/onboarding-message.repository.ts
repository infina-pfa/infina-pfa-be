import { OnboardingMessagePrismaRepository } from '@/common/prisma';
import { Injectable } from '@nestjs/common';
import { OnboardingMessageRepository } from '@/onboarding/domain';
import { PrismaClient } from '@/common/prisma/prisma-client';

@Injectable()
export class OnboardingMessageRepositoryImpl
  extends OnboardingMessagePrismaRepository
  implements OnboardingMessageRepository
{
  constructor(private readonly prismaClient: PrismaClient) {
    super(prismaClient);
  }
}
