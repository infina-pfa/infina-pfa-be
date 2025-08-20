import { DebtAggregate, DebtAggregateRepository } from '../domain';
import { BaseUseCase } from '@/common/base/use-case/base.use-case';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetDebtsUseCase extends BaseUseCase<void, DebtAggregate[]> {
  constructor(
    private readonly debtAggregateRepository: DebtAggregateRepository,
  ) {
    super();
  }

  async execute(): Promise<DebtAggregate[]> {
    return this.debtAggregateRepository.findMany({});
  }
}
