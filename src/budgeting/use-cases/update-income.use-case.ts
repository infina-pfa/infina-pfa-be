import { CurrencyVO } from '@/common/base';
import { BaseUseCase } from '@/common/base/use-case/base.use-case';
import { Currency } from '@/common/types';
import { Injectable } from '@nestjs/common';
import {
  BudgetErrorFactory,
  TransactionEntity,
  TransactionRepository,
} from '../domain';

export type UpdateIncomeUseCaseInput = {
  id: string;
  userId?: string;
  amount: number;
  recurring: number;
  name: string;
};

@Injectable()
export class UpdateIncomeUseCase extends BaseUseCase<
  UpdateIncomeUseCaseInput,
  TransactionEntity
> {
  constructor(private readonly transactionRepository: TransactionRepository) {
    super();
  }

  async execute(input: UpdateIncomeUseCaseInput): Promise<TransactionEntity> {
    const income = await this.transactionRepository.findById(input.id);

    if (!income || (input.userId && income.props.userId !== input.userId)) {
      throw BudgetErrorFactory.incomeNotFound();
    }

    income.update({
      amount: new CurrencyVO(input.amount, Currency.VND),
      recurring: input.recurring,
      name: input.name,
    });

    await this.transactionRepository.update(income);
    return income;
  }
}
