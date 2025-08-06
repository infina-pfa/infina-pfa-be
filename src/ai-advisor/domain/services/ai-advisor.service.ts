export abstract class AiAdvisorService {
  abstract stream(
    userId: string,
    conversationId: string,
    message: string,
    callbacks?: {
      onData?: (chunk: Buffer) => void;
      onEnd?: () => void;
      onError?: (error: Error) => void;
    },
  ): Promise<void>;

  abstract handleStreamChunk(
    userId: string,
    conversationId: string,
    chunk: Buffer,
  ): void;
}
