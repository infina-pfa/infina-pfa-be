import { BaseUseCase } from '@/common/base/use-case/base.use-case';
import { Injectable } from '@nestjs/common';
import { AiAdvisorService } from '../domain';

export interface GetStartMessageUseCaseInput {
  userId: string;
}

@Injectable()
export class GetStartMessageUseCase extends BaseUseCase<
  GetStartMessageUseCaseInput,
  string
> {
  constructor(private readonly aiAdvisorService: AiAdvisorService) {
    super();
  }

  async execute(input: GetStartMessageUseCaseInput): Promise<string> {
    return this.aiAdvisorService.getStartMessage(input.userId);
  }
}
