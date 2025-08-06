import { Module } from '@nestjs/common';
import { repositories } from '@/ai-advisor/infrastructure/repositories';
import { aiAdvisorUseCases } from '@/ai-advisor/use-cases';
import { AiAdvisorController } from '@/ai-advisor/controllers/ai-advisor.controller';

@Module({
  controllers: [AiAdvisorController],
  providers: [...repositories, ...aiAdvisorUseCases],
  exports: [...repositories, ...aiAdvisorUseCases],
})
export class AiAdvisorModule {}
