import { CurrencyVO } from '@/common/base';
import { BaseUseCase } from '@/common/base/use-case/base.use-case';
import { Injectable } from '@nestjs/common';
import { DebtAggregate, DebtAggregateRepository, DebtType } from '../domain';

export interface CreateDebtUseCaseInput {
  userId: string;
  lender: string;
  purpose: string;
  rate: number;
  dueDate: Date;
  amount: number;
  currentPaidAmount: number;
  type?: DebtType;
}

@Injectable()
export class CreateDebtUseCase extends BaseUseCase<
  CreateDebtUseCaseInput,
  DebtAggregate
> {
  constructor(
    private readonly debtAggregateRepository: DebtAggregateRepository,
  ) {
    super();
  }

  async execute(input: CreateDebtUseCaseInput): Promise<DebtAggregate> {
    const debtAggregate = DebtAggregate.newDebt(input.userId, {
      lender: input.lender,
      purpose: input.purpose,
      rate: input.rate,
      dueDate: input.dueDate,
      amount: new CurrencyVO(input.amount),
      currentPaidAmount: new CurrencyVO(input.currentPaidAmount),
      type: input.type ?? DebtType.BAD_DEBT,
    });

    await this.debtAggregateRepository.save(debtAggregate);

    return debtAggregate;
  }
}
