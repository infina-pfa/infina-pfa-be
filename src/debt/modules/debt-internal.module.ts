import { PrismaModule } from '@/common/prisma';
import { Module } from '@nestjs/common';
import { DebtInternalController } from '../controllers';
import { repositories } from '../infrastructure/repositories';
import { services } from '../infrastructure/services';
import { useCases } from '../use-cases';

@Module({
  imports: [PrismaModule],
  controllers: [DebtInternalController],
  providers: [...repositories, ...useCases, ...services],
})
export class DebtInternalModule {}
