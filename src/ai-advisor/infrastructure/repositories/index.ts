import { Provider } from '@nestjs/common';
import { ConversationRepository } from '@/ai-advisor/domain/repositories/conversation.repository';
import { MessageRepository } from '@/ai-advisor/domain/repositories/message.repository';
import { ConversationRepositoryImpl } from './conversation.repository';
import { MessageRepositoryImpl } from './message.repository';

export const repositories: Provider[] = [
  {
    provide: ConversationRepository,
    useClass: ConversationRepositoryImpl,
  },
  {
    provide: MessageRepository,
    useClass: MessageRepositoryImpl,
  },
];
