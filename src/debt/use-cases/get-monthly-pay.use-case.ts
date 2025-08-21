import { BaseUseCase } from '@/common/base';
import { Injectable } from '@nestjs/common';
import { DebtManagerService } from '../domain';

export interface GetMonthlyPaymentUseCaseInput {
  userId: string;
}

@Injectable()
export class GetMonthlyPaymentUseCase extends BaseUseCase<
  GetMonthlyPaymentUseCaseInput,
  { monthlyPayment: number }
> {
  constructor(private readonly debtManagerService: DebtManagerService) {
    super();
  }

  async execute(input: GetMonthlyPaymentUseCaseInput): Promise<{
    monthlyPayment: number;
  }> {
    const monthlyPayment = await this.debtManagerService.getMonthlyPayment(
      input.userId,
    );

    return {
      monthlyPayment,
    };
  }
}
