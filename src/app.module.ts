import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupabaseAuthGuard } from './common/guards/supabase-auth.guard';
import { UserModule } from './user';
import { APP_GUARD } from '@nestjs/core';
import { BudgetingModule } from './budgeting/module/budgeting.module';
import { PrismaModule } from './common/prisma';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    BudgetingModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useExisting: SupabaseAuthGuard,
    },
    SupabaseAuthGuard,
    AppService,
  ],
})
export class AppModule {}
