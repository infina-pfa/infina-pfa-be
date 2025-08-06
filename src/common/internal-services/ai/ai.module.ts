import { Module } from '@nestjs/common';
import { AiInternalService } from './ai.service';

@Module({
  providers: [AiInternalService],
  exports: [AiInternalService],
})
export class InternalAiModule {}
