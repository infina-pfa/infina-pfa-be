import { BaseUseCase } from '@/common/base/use-case/base.use-case';
import { Injectable } from '@nestjs/common';
import { DebtAggregate, DebtAggregateRepository } from '../domain';
import { DebtErrorFactory } from '../domain/errors/error.factory';
import { CurrencyVO } from '@/common/base';

export interface PayDebtUseCaseInput {
  userId: string;
  debtId: string;
  amount: number;
  name?: string;
  description?: string;
}
@Injectable()
export class PayDebtUseCase extends BaseUseCase<
  PayDebtUseCaseInput,
  DebtAggregate
> {
  constructor(
    private readonly debtAggregateRepository: DebtAggregateRepository,
  ) {
    super();
  }

  async execute(input: PayDebtUseCaseInput): Promise<DebtAggregate> {
    const debtAggregate = await this.debtAggregateRepository.findById(
      input.debtId,
    );

    if (!debtAggregate) {
      throw DebtErrorFactory.debtNotFound();
    }

    if (debtAggregate?.userId !== input.userId) {
      throw DebtErrorFactory.forbiddenDebt();
    }

    debtAggregate.pay(
      new CurrencyVO(input.amount),
      input.name,
      input.description,
    );

    await this.debtAggregateRepository.save(debtAggregate);

    return debtAggregate;
  }
}
