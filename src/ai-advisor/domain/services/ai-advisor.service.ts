import { MessageSender } from '../entities/message.entity';

export abstract class AiAdvisorService {
  abstract stream(
    userId: string,
    sender: MessageSender,
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

  abstract getStartMessage(userId: string): Promise<string>;
}
