import { BaseUseCase } from '@/common/base/use-case/base.use-case';
import { Injectable } from '@nestjs/common';
import { DebtAggregateRepository } from '../domain';
import { DebtErrorFactory } from '../domain/errors/error.factory';

export interface RemoveDebtPaymentUseCaseInput {
  userId: string;
  debtId: string;
  debtPaymentId: string;
}

@Injectable()
export class RemoveDebtPaymentUseCase extends BaseUseCase<
  RemoveDebtPaymentUseCaseInput,
  void
> {
  constructor(
    private readonly debtAggregateRepository: DebtAggregateRepository,
  ) {
    super();
  }

  async execute(input: RemoveDebtPaymentUseCaseInput): Promise<void> {
    const debtAggregate = await this.debtAggregateRepository.findById(
      input.debtPaymentId,
    );

    if (debtAggregate?.userId !== input.userId) {
      throw DebtErrorFactory.forbiddenDebt();
    }

    if (!debtAggregate) {
      throw DebtErrorFactory.debtNotFound();
    }

    debtAggregate.removePayment(input.debtPaymentId);

    await this.debtAggregateRepository.save(debtAggregate);
  }
}
