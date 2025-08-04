import { GoalRepository } from '@/goals/domain';
import { PrismaClient } from '@/common/prisma/prisma-client';
import { GoalPrismaRepository } from '@/common/prisma';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GoalRepositoryImpl
  extends GoalPrismaRepository
  implements GoalRepository
{
  constructor(private readonly prismaClient: PrismaClient) {
    super(prismaClient);
  }
}
