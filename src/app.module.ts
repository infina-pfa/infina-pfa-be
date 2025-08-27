import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { AiAdvisorInternalModule } from './ai-advisor/module/ai-advisor-internal.module';
import { AiAdvisorModule } from './ai-advisor/module/ai-advisor.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BudgetingInternalModule } from './budgeting/module/budgeting-internal.module';
import { BudgetingModule } from './budgeting/module/budgeting.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { InternalServiceAuthGuard, WebhookAuthGuard } from './common/guards';
import { SupabaseAuthGuard } from './common/guards/supabase-auth.guard';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { LoggerModule } from './common/logger/logger.module';
import { PrismaModule } from './common/prisma';
import { DebtInternalModule } from './debt/modules/debt-internal.module';
import { DebtModule } from './debt/modules/debt.module';
import { GoalInternalModule, GoalModule } from './goals/module';
import { OnboardingInternalModule } from './onboarding/module/onboarding-internal.module';
import { OnboardingModule } from './onboarding/module/onboarding.module';
import { UserInternalModule, UserModule } from './user';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    EventEmitterModule.forRoot(),
    LoggerModule,
    PrismaModule,
    BudgetingModule,
    UserModule,
    GoalModule,
    OnboardingModule,
    AiAdvisorModule,
    AiAdvisorInternalModule,
    UserInternalModule,
    BudgetingInternalModule,
    GoalInternalModule,
    OnboardingInternalModule,
    DebtModule,
    DebtInternalModule,
  ],
  controllers: [AppController],
  providers: [
    SupabaseAuthGuard,
    InternalServiceAuthGuard,
    WebhookAuthGuard,
    AppService,
    LoggingInterceptor,
    AllExceptionsFilter,
  ],
})
export class AppModule {}
