import { Module } from '@nestjs/common';
import { repositories } from '@/ai-advisor/infrastructure/repositories';
import { aiAdvisorUseCases } from '@/ai-advisor/use-cases';
import { AiAdvisorController } from '@/ai-advisor/controllers/ai-advisor.controller';
import { InternalAiModule } from '@/common/internal-services';
import { services } from '@/ai-advisor/infrastructure/services';
import { StorageModule } from '@/common/storage';

@Module({
  imports: [InternalAiModule, StorageModule],
  controllers: [AiAdvisorController],
  providers: [...repositories, ...aiAdvisorUseCases, ...services],
  exports: [...repositories, ...aiAdvisorUseCases],
})
export class AiAdvisorModule {}
