import { PrismaClient } from '@/common/prisma';
import { Injectable } from '@nestjs/common';
import { UserPrismaRepository } from '@/common/prisma/repositories/user-prisma.repository';

@Injectable()
export class UserRepositoryImpl extends UserPrismaRepository {
  constructor(prismaClient: PrismaClient) {
    super(prismaClient);
  }
}
