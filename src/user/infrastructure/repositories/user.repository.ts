import { PrismaClient } from '@/common';
import { Injectable } from '@nestjs/common';
import { UserPrismaRepository } from '@/common/repositories/user-prisma.repository';

@Injectable()
export class UserRepositoryImpl extends UserPrismaRepository {
  constructor(prismaClient: PrismaClient) {
    super(prismaClient);
  }
}
