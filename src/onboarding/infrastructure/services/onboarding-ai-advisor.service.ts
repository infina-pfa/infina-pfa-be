import {
  AiInternalService,
  AiStreamFlowType,
} from '@/common/internal-services';
import {
  OnboardingAiAdvisorService,
  OnboardingErrorFactory,
  OnboardingMessageEntity,
  OnboardingMessageRepository,
  OnboardingMessageSender,
  OnboardingProfileEntity,
  OnboardingProfileRepository,
} from '@/onboarding/domain';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class OnboardingAiAdvisorServiceImpl
  implements OnboardingAiAdvisorService
{
  private readonly logger = new Logger(OnboardingAiAdvisorServiceImpl.name);

  constructor(
    private readonly onboardingMessageRepository: OnboardingMessageRepository,
    private readonly onboardingProfileRepository: OnboardingProfileRepository,
    private readonly aiInternalService: AiInternalService,
  ) {}

  async stream(
    userId: string,
    message: string,
    callbacks?: {
      onData?: (chunk: Buffer) => void;
      onEnd?: () => void;
      onError?: (error: Error) => void;
    },
  ): Promise<void> {
    const userMessage = OnboardingMessageEntity.create({
      userId,
      sender: OnboardingMessageSender.USER,
      content: message,
    });

    const profile = await this.onboardingProfileRepository.findOne({ userId });

    if (!profile) {
      throw OnboardingErrorFactory.profileNotFound();
    }

    await this.onboardingMessageRepository.create(userMessage);

    const stream = await this.aiInternalService.stream(
      userId,
      {
        message,
        conversationId: `onboarding-${profile.sessionId}`,
        flowType: AiStreamFlowType.ONBOARDING,
      },
      callbacks,
    );

    return stream;
  }

  @Cron('0 0 1 * *')
  async resetPfyMetadata(): Promise<void> {
    const limit = 100;
    let page = 0;

    while (true) {
      this.logger.log(`Resetting Pyf metadata for page ${page}`);
      const profiles = await this.onboardingProfileRepository.findMany(
        {},
        {
          pagination: {
            page,
            limit,
          },
        },
      );

      const batch: Promise<OnboardingProfileEntity>[] = [];
      for (const profile of profiles) {
        profile.resetPyfMetadata();
        batch.push(this.onboardingProfileRepository.update(profile));
      }

      await Promise.all(batch);

      this.logger.log(`Resetted Pyf metadata for page ${page}`);
      if (profiles.length !== limit) {
        break;
      }

      page++;
    }
  }
}
