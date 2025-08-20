import { Module } from '@nestjs/common';
import { repositories } from '../infrastructure/repositories';
import { useCases } from '../use-cases';

@Module({
  providers: [...repositories, ...useCases],
})
export class DebtInternalModule {}
