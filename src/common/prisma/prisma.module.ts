import { Global, Module, Provider } from '@nestjs/common';
import { PrismaClient } from './prisma-client';
import {
  softDelete,
  softDeleteMany,
  filterSoftDeleted,
} from './extensions/soft-delete.prisma-extension';

const prismaClient = new PrismaClient();

const prismaProvider: Provider = {
  provide: PrismaClient,
  useValue: prismaClient
    .$extends(softDelete)
    .$extends(softDeleteMany)
    .$extends(filterSoftDeleted),
};

@Global()
@Module({
  providers: [prismaProvider],
  exports: [prismaProvider],
})
export class PrismaModule {}
