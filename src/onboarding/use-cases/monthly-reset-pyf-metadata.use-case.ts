import { BaseUseCase } from '@/common/base/use-case/base.use-case';
import { Injectable } from '@nestjs/common';
import { OnboardingAiAdvisorService } from '../domain';

@Injectable()
export class MonthlyResetPyfMetadataUseCase extends BaseUseCase<void, void> {
  constructor(
    private readonly onboardingAiAdvisorService: OnboardingAiAdvisorService,
  ) {
    super();
  }

  async execute(): Promise<void> {
    await this.onboardingAiAdvisorService.resetPfyMetadata();
  }
}
