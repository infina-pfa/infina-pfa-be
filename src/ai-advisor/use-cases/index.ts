import { Provider } from '@nestjs/common';
import { CreateConversationUseCase } from './create-conversation.use-case';
import { CreateMessageUseCase } from './create-message.use-case';
import { GetConversationUseCase } from './get-conversation.use-case';
import { GetMessagesUseCase } from './get-messages.use-case';
import { GetStartMessageUseCase } from './get-start-message.use-case';

export const aiAdvisorUseCases: Provider[] = [
  CreateConversationUseCase,
  GetConversationUseCase,
  CreateMessageUseCase,
  GetMessagesUseCase,
  GetStartMessageUseCase,
];

export {
  CreateConversationUseCase,
  CreateMessageUseCase,
  GetConversationUseCase,
  GetMessagesUseCase,
  GetStartMessageUseCase,
};
