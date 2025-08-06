import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BudgetingInternalModule } from './budgeting/module/budgeting-internal.module';
import { BudgetingModule } from './budgeting/module/budgeting.module';
import { InternalServiceAuthGuard } from './common/guards';
import { SupabaseAuthGuard } from './common/guards/supabase-auth.guard';
import { PrismaModule } from './common/prisma';
import { GoalInternalModule, GoalModule } from './goals/module';
import { OnboardingInternalModule } from './onboarding/module/onboarding-internal.module';
import { OnboardingModule } from './onboarding/module/onboarding.module';
import { UserInternalModule, UserModule } from './user';
import { AiAdvisorModule } from './ai-advisor/module/ai-advisor.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    BudgetingModule,
    UserModule,
    GoalModule,
    OnboardingModule,
    AiAdvisorModule,
    UserInternalModule,
    BudgetingInternalModule,
    GoalInternalModule,
    OnboardingInternalModule,
  ],
  controllers: [AppController],
  providers: [SupabaseAuthGuard, InternalServiceAuthGuard, AppService],
})
export class AppModule {}
