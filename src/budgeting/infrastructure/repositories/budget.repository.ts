import { BudgetPrismaRepository } from '@/common/prisma';
import { Injectable } from '@nestjs/common';
import { BudgetRepository } from '@/budgeting/domain';
import { PrismaClient } from '@/common/prisma/prisma-client';

@Injectable()
export class BudgetRepositoryImpl
  extends BudgetPrismaRepository
  implements BudgetRepository
{
  constructor(private readonly prismaClient: PrismaClient) {
    super(prismaClient);
  }
}
