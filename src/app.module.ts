import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupabaseModule } from './common';
import { BudgetingModule } from './budgeting/module/budgeting.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    SupabaseModule,
    BudgetingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
