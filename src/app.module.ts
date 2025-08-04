import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BudgetingModule } from './budgeting/module/budgeting.module';
import { InternalServiceAuthGuard } from './common/guards';
import { SupabaseAuthGuard } from './common/guards/supabase-auth.guard';
import { PrismaModule } from './common/prisma';
import { GoalModule } from './goals/module';
import { UserInternalModule, UserModule } from './user';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    BudgetingModule,
    UserModule,
    UserInternalModule,
    GoalModule,
  ],
  controllers: [AppController],
  providers: [SupabaseAuthGuard, InternalServiceAuthGuard, AppService],
})
export class AppModule {}
