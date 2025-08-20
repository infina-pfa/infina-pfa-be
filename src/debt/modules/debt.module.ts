import { Module } from '@nestjs/common';
import { repositories } from '../infrastructure/repositories';
import { useCases } from '../use-cases';
import { DebtController } from '../controllers';
import { PrismaModule } from '@/common/prisma';
@Module({
  imports: [PrismaModule],
  providers: [...repositories, ...useCases],
  controllers: [DebtController],
})
export class DebtModule {}
