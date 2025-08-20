import { DebtRepository } from '@/debt/domain';
import { DebtPrismaRepository } from '@/common/prisma';
import { PrismaClient } from '@/common/prisma/prisma-client';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DebtRepositoryImpl
  extends DebtPrismaRepository
  implements DebtRepository
{
  constructor(private readonly prismaClient: PrismaClient) {
    super(prismaClient);
  }
}
