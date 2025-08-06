import { Module } from '@nestjs/common';
import { repositories } from '@/ai-advisor/infrastructure/repositories';
import { aiAdvisorUseCases } from '@/ai-advisor/use-cases';
import { AiAdvisorController } from '@/ai-advisor/controllers/ai-advisor.controller';
import { InternalAiModule } from '@/common/internal-services';
import { services } from '@/ai-advisor/infrastructure/services';
import { AiInternalAdvisorController } from '../controllers/ai-internal-advisor.controller';

@Module({
  imports: [InternalAiModule],
  controllers: [AiAdvisorController, AiInternalAdvisorController],
  providers: [...repositories, ...aiAdvisorUseCases, ...services],
  exports: [...repositories, ...aiAdvisorUseCases],
})
export class AiAdvisorModule {}
