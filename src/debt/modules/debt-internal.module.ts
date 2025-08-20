import { Module } from '@nestjs/common';
import { repositories } from '../infrastructure/repositories';

@Module({
  imports: [],
  providers: [...repositories],
  exports: [...repositories],
})
export class DebtInternalModule {}
