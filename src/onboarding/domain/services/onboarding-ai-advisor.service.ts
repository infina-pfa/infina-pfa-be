export abstract class OnboardingAiAdvisorService {
  abstract stream(
    userId: string,
    message: string,
    callbacks?: {
      onData?: (chunk: Buffer) => void;
      onEnd?: () => void;
      onError?: (error: Error) => void;
    },
  ): Promise<void>;

  abstract resetPfyMetadata(): Promise<void>;
}
