import { MessageSender } from '../entities/message.entity';

export abstract class AiAdvisorService {
  abstract stream(
    userId: string,
    data: {
      sender: MessageSender;
      conversationId: string;
      message: string;
      imageUrls?: string[];
    },
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

  abstract speechToText(
    file: Express.Multer.File,
    provider?: string,
    language?: string,
    enableFallback?: boolean,
  ): Promise<string>;

  abstract getStartMessage(userId: string): Promise<string>;
}
