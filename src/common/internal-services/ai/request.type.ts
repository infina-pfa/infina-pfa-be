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

export type AiStreamImage = {
  type: 'base64';
  data: string;
  detail: 'auto';
  mime_type: string;
};

export type AiStreamSTTResponse = {
  text: string;
  provider: string;
  language: string;
  metadata: {
    model: string;
    processing_time: number;
    fallback_used: boolean;
    failed_providers?: string[];
  };
};

export type AiStreamBody = {
  user_id: string;
  user_message: string;
  conversation_history: AiStreamConversationMessage[];
  flow_type: AiStreamFlowType;
  images: AiStreamImage[];
};
