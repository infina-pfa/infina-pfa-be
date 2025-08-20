import { DebtAggregate, DebtAggregateRepository } from '../domain';
import { BaseUseCase } from '@/common/base/use-case/base.use-case';
import { Injectable } from '@nestjs/common';

export interface GetDebtsUseCaseInput {
  userId: string;
}

@Injectable()
export class GetDebtsUseCase extends BaseUseCase<
  GetDebtsUseCaseInput,
  DebtAggregate[]
> {
  constructor(
    private readonly debtAggregateRepository: DebtAggregateRepository,
  ) {
    super();
  }

  async execute(input: GetDebtsUseCaseInput): Promise<DebtAggregate[]> {
    return this.debtAggregateRepository.findMany({ userId: input.userId });
  }
}
