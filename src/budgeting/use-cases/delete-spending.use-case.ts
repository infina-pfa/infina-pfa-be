import { BaseUseCase } from '@/common/base/use-case/base.use-case';
import { Injectable } from '@nestjs/common';
import { BudgetErrorFactory, TransactionRepository } from '../domain';

type DeleteSpendingUseCaseInput = {
  spendingId: string;
  userId?: string;
};

@Injectable()
export class DeleteSpendingUseCase extends BaseUseCase<
  DeleteSpendingUseCaseInput,
  void
> {
  constructor(private readonly transactionRepository: TransactionRepository) {
    super();
  }

  async execute(input: DeleteSpendingUseCaseInput): Promise<void> {
    const spending = await this.transactionRepository.findById(
      input.spendingId,
    );

    if (!spending || (input.userId && spending.props.userId !== input.userId)) {
      throw BudgetErrorFactory.spendingNotFound();
    }

    await this.transactionRepository.delete(spending);
  }
}
