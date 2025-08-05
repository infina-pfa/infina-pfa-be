import { PrismaModule } from '@/common/prisma';
import { Module } from '@nestjs/common';
import { UserInternalController } from '../controllers/user-internal.controller';
import { repositories } from '../infrastructure/repositories';
import { useCases } from '../use-cases';

@Module({
  imports: [PrismaModule],
  controllers: [UserInternalController],
  providers: [...repositories, ...useCases],
})
export class UserInternalModule {}
