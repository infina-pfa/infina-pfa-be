import { BaseUseCase } from '@/common/base';
import { Injectable } from '@nestjs/common';
import { DebtManagerService } from '../domain';

export interface GetMonthlyPaymentUseCaseInput {
  userId: string;
}

@Injectable()
export class GetMonthlyPaymentUseCase extends BaseUseCase<
  GetMonthlyPaymentUseCaseInput,
  number
> {
  constructor(private readonly debtManagerService: DebtManagerService) {
    super();
  }

  async execute(input: GetMonthlyPaymentUseCaseInput): Promise<number> {
    return this.debtManagerService.getMonthlyPayment(input.userId);
  }
}
