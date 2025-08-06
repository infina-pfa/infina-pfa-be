import { Provider } from '@nestjs/common';
import { CreateConversationUseCase } from './create-conversation.use-case';
import { GetConversationUseCase } from './get-conversation.use-case';
import { CreateMessageUseCase } from './create-message.use-case';
import { GetMessagesUseCase } from './get-messages.use-case';

export const aiAdvisorUseCases: Provider[] = [
  CreateConversationUseCase,
  GetConversationUseCase,
  CreateMessageUseCase,
  GetMessagesUseCase,
];

export {
  CreateConversationUseCase,
  GetConversationUseCase,
  CreateMessageUseCase,
  GetMessagesUseCase,
};
