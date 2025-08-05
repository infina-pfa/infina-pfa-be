import { OnboardingProfilePrismaRepository } from '@/common/prisma';
import { Injectable } from '@nestjs/common';
import { OnboardingProfileRepository } from '@/onboarding/domain';
import { PrismaClient } from '@/common/prisma/prisma-client';

@Injectable()
export class OnboardingProfileRepositoryImpl
  extends OnboardingProfilePrismaRepository
  implements OnboardingProfileRepository
{
  constructor(private readonly prismaClient: PrismaClient) {
    super(prismaClient);
  }
}
