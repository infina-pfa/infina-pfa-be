import { BaseUseCase } from '@/common/base/use-case/base.use-case';
import { Injectable } from '@nestjs/common';
import { DebtAggregate, DebtAggregateRepository } from '../domain';
import { DebtErrorFactory } from '../domain/errors/error.factory';

export interface GetDebtUseCaseInput {
  userId: string;
  debtId: string;
}

@Injectable()
export class GetDebtUseCase extends BaseUseCase<
  GetDebtUseCaseInput,
  DebtAggregate
> {
  constructor(
    private readonly debtAggregateRepository: DebtAggregateRepository,
  ) {
    super();
  }

  async execute(input: GetDebtUseCaseInput): Promise<DebtAggregate> {
    const debtAggregate = await this.debtAggregateRepository.findById(
      input.debtId,
    );

    if (debtAggregate?.userId !== input.userId) {
      throw DebtErrorFactory.forbiddenDebt();
    }

    if (!debtAggregate) {
      throw DebtErrorFactory.debtNotFound();
    }

    return debtAggregate;
  }
}
