import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BudgetingModule } from './budgeting/module/budgeting.module';
import { InternalServiceAuthGuard } from './common/guards';
import { SupabaseAuthGuard } from './common/guards/supabase-auth.guard';
import { PrismaModule } from './common/prisma';
import { GoalInternalModule, GoalModule } from './goals/module';
import { UserInternalModule, UserModule } from './user';
import { BudgetingInternalModule } from './budgeting/module/budgeting-internal.module';
import { OnboardingModule } from './onboarding/module/onboarding.module';

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
    UserInternalModule,
    BudgetingInternalModule,
    GoalInternalModule,
  ],
  controllers: [AppController],
  providers: [SupabaseAuthGuard, InternalServiceAuthGuard, AppService],
})
export class AppModule {}
