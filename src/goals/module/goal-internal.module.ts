import { PrismaModule } from '@/common/prisma';
import { Module } from '@nestjs/common';
import { GoalInternalController } from '../controllers';
import { GoalAggregateRepository, GoalRepository } from '../domain';
import { TransactionRepository } from '../domain/repositories/transaction.repository';
import {
  GoalAggregateRepositoryImpl,
  GoalRepositoryImpl,
} from '../infrastructure/repositories';
import { TransactionRepositoryImpl } from '../infrastructure/repositories/transaction.repository';
import {
  ContributeGoalUseCase,
  CreateGoalUseCase,
  GetGoalsUseCase,
  UpdateGoalUseCase,
  WithdrawGoalUseCase,
} from '../use-cases';

@Module({
  imports: [PrismaModule],
  controllers: [GoalInternalController],
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
    ContributeGoalUseCase,
    WithdrawGoalUseCase,
  ],
})
export class GoalInternalModule {}
