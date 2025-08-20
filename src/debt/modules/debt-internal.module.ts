import { Module } from '@nestjs/common';
import { repositories } from '../infrastructure/repositories';
import { useCases } from '../use-cases';
import { PrismaModule } from '@/common/prisma';
import { DebtInternalController } from '../controllers';

@Module({
  imports: [PrismaModule],
  controllers: [DebtInternalController],
  providers: [...repositories, ...useCases],
})
export class DebtInternalModule {}
