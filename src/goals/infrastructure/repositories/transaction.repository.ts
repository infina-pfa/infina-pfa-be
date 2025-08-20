import { TransactionRepository } from '@/goals/domain/repositories/transaction.repository';
import { PrismaClient } from '@/common/prisma/prisma-client';
import { TransactionPrismaRepository } from '@/common/prisma';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TransactionRepositoryImpl
  extends TransactionPrismaRepository
  implements TransactionRepository
{
  constructor(prismaClient: PrismaClient) {
    super(prismaClient);
  }
}
