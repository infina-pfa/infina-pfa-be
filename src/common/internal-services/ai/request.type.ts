export enum AiStreamConversationMessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
}

export type AiStreamConversationMessage = {
  role: AiStreamConversationMessageRole;
  content: string;
};

export enum AiStreamFlowType {
  ONBOARDING = 'onboarding',
  CHAT = 'chat',
}

export type AiStreamBody = {
  user_id: string;
  user_message: string;
  conversation_history: AiStreamConversationMessage[];
  flow_type: AiStreamFlowType;
};
