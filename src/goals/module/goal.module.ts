import { PrismaModule } from '@/common/prisma';
import { Module } from '@nestjs/common';
import { GoalController } from '../controllers';
import {
  GoalRepositoryImpl,
  GoalAggregateRepositoryImpl,
} from '../infrastructure/repositories';
import { TransactionRepositoryImpl } from '../infrastructure/repositories/transaction.repository';
import {
  CreateGoalUseCase,
  GetGoalsUseCase,
  UpdateGoalUseCase,
} from '../use-cases';
import { GoalRepository, GoalAggregateRepository } from '../domain';
import { TransactionRepository } from '../domain/repositories/transaction.repository';

@Module({
  imports: [PrismaModule],
  controllers: [GoalController],
  providers: [
    {
      provide: GoalRepository,
      useClass: GoalRepositoryImpl,
    },
    {
      provide: TransactionRepository,
      useClass: TransactionRepositoryImpl,
    },
    {
      provide: GoalAggregateRepository,
      useClass: GoalAggregateRepositoryImpl,
    },
    CreateGoalUseCase,
    GetGoalsUseCase,
    UpdateGoalUseCase,
  ],
})
export class GoalModule {}
