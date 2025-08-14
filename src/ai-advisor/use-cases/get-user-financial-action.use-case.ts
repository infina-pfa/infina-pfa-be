import { BaseUseCase } from '@/common/base/use-case/base.use-case';
import { Injectable } from '@nestjs/common';
import { UserFinancialAction, UserFinancialManagerService } from '../domain';

export interface GetUserFinancialActionUseCaseInput {
  userId: string;
}

@Injectable()
export class GetUserFinancialActionUseCase extends BaseUseCase<
  GetUserFinancialActionUseCaseInput,
  UserFinancialAction
> {
  constructor(
    private readonly userFinancialManagerService: UserFinancialManagerService,
  ) {
    super();
  }

  async execute(
    input: GetUserFinancialActionUseCaseInput,
  ): Promise<UserFinancialAction> {
    return this.userFinancialManagerService.getUserFinancialAction(
      input.userId,
    );
  }
}
