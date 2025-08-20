import { BaseUseCase } from '@/common/base/use-case/base.use-case';
import { Injectable } from '@nestjs/common';
import { DebtEntity, DebtRepository } from '../domain';
import { DebtErrorFactory } from '../domain/errors/error.factory';

export interface UpdateDebtUseCaseInput {
  userId: string;
  debtId: string;
  lender?: string;
  purpose?: string;
  rate?: number;
  dueDate?: Date;
}

@Injectable()
export class UpdateDebtUseCase extends BaseUseCase<
  UpdateDebtUseCaseInput,
  DebtEntity
> {
  constructor(private readonly debtRepository: DebtRepository) {
    super();
  }

  async execute(input: UpdateDebtUseCaseInput): Promise<DebtEntity> {
    const debt = await this.debtRepository.findById(input.debtId);

    if (!debt) {
      throw DebtErrorFactory.debtNotFound();
    }

    if (debt?.userId !== input.userId) {
      throw DebtErrorFactory.forbiddenDebt();
    }

    debt.update({
      lender: input.lender,
      purpose: input.purpose,
      rate: input.rate,
      dueDate: input.dueDate,
    });

    await this.debtRepository.update(debt);

    return debt;
  }
}
