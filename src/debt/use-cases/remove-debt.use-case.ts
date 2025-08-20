import { BaseUseCase } from '@/common/base/use-case/base.use-case';
import { Injectable } from '@nestjs/common';
import { DebtAggregateRepository } from '../domain';
import { DebtErrorFactory } from '../domain/errors/error.factory';

export interface RemoveDebtUseCaseInput {
  userId: string;
  debtId: string;
}

@Injectable()
export class RemoveDebtUseCase extends BaseUseCase<
  RemoveDebtUseCaseInput,
  void
> {
  constructor(
    private readonly debtAggregateRepository: DebtAggregateRepository,
  ) {
    super();
  }

  async execute(input: RemoveDebtUseCaseInput): Promise<void> {
    const debtAggregate = await this.debtAggregateRepository.findById(
      input.debtId,
    );

    if (!debtAggregate) {
      throw DebtErrorFactory.debtNotFound();
    }

    if (debtAggregate.props.debt.userId !== input.userId) {
      throw DebtErrorFactory.forbiddenDebt();
    }

    await this.debtAggregateRepository.delete(debtAggregate);
  }
}
