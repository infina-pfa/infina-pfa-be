import { UploadResult } from '@/common/storage';

export abstract class ConversationManagerService {
  public static readonly CONVERSATION_IMAGES_BUCKET = 'conversation-images';

  abstract uploadImage(
    userId: string,
    conversationId: string,
    file: Express.Multer.File,
  ): Promise<UploadResult>;
}
