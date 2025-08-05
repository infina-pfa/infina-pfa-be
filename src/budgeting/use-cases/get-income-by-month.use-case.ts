import { BaseUseCase } from '@/common/base/use-case/base.use-case';
import { Injectable } from '@nestjs/common';
import { IncomeAggregate, IncomeRepository } from '../domain';

export type GetIncomeByMonthUseCaseInput = {
  userId: string;
  month: number;
  year: number;
};

@Injectable()
export class GetIncomeByMonthUseCase extends BaseUseCase<
  GetIncomeByMonthUseCaseInput,
  IncomeAggregate | null
> {
  constructor(private readonly incomeRepository: IncomeRepository) {
    super();
  }

  async execute(
    input: GetIncomeByMonthUseCaseInput,
  ): Promise<IncomeAggregate | null> {
    return this.incomeRepository.findByMonth(
      input.userId,
      input.month,
      input.year,
    );
  }
}
