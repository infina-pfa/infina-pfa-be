import { repositories } from '@/ai-advisor/infrastructure/repositories';
import { services } from '@/ai-advisor/infrastructure/services';
import { aiAdvisorUseCases } from '@/ai-advisor/use-cases';
import { InternalAiModule } from '@/common/internal-services';
import { Module } from '@nestjs/common';
import { AiInternalAdvisorController } from '../controllers/ai-internal-advisor.controller';

@Module({
  imports: [InternalAiModule],
  controllers: [AiInternalAdvisorController],
  providers: [...repositories, ...aiAdvisorUseCases, ...services],
  exports: [...repositories, ...aiAdvisorUseCases],
})
export class AiAdvisorInternalModule {}
