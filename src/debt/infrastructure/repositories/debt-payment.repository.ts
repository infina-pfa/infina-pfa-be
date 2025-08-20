import { PrismaClient, TransactionPrismaRepository } from '@/common/prisma';
import { DebtPaymentRepository } from '@/debt/domain';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DebtPaymentRepositoryImpl
  extends TransactionPrismaRepository
  implements DebtPaymentRepository
{
  constructor(protected readonly prismaClient: PrismaClient) {
    super(prismaClient);
  }
}
