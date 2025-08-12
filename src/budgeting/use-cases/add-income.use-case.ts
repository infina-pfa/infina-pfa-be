import { BaseUseCase } from '@/common/base/use-case/base.use-case';
import { Injectable } from '@nestjs/common';
import { IncomeAggregate, IncomeRepository } from '../domain';
import { TransactionsWatchList } from '../domain/watch-list/transactions.watch-list';

export type AddIncomeUseCaseInput = {
  userId: string;
  amount: number;
  recurring: number;
  name: string;
};

@Injectable()
export class AddIncomeUseCase extends BaseUseCase<
  AddIncomeUseCaseInput,
  IncomeAggregate
> {
  constructor(private readonly incomeRepository: IncomeRepository) {
    super();
  }

  async execute(input: AddIncomeUseCaseInput): Promise<IncomeAggregate> {
    console.log('🚀 ~ AddIncomeUseCase ~ execute ~ input:', input);
    const income = IncomeAggregate.create({
      userId: input.userId,
      transactions: new TransactionsWatchList([]),
    });

    income.addIncome(input.amount, input.recurring, input.name);

    await this.incomeRepository.add(income);

    return income;
  }
}
