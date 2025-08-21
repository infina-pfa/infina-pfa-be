import { PrismaModule } from '@/common/prisma';
import { Module } from '@nestjs/common';
import { DebtController } from '../controllers';
import { repositories } from '../infrastructure/repositories';
import { services } from '../infrastructure/services';
import { useCases } from '../use-cases';
@Module({
  imports: [PrismaModule],
  providers: [...repositories, ...useCases, ...services],
  controllers: [DebtController],
})
export class DebtModule {}
