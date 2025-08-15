import { StorageService, UploadResult } from '@/common/storage';
import { Injectable } from '@nestjs/common';
import {
  AiAdvisorErrorFactory,
  ConversationManagerService,
  ConversationRepository,
} from '../../domain';

@Injectable()
export class ConversationManagerServiceImpl
  implements ConversationManagerService
{
  constructor(
    private readonly storageService: StorageService,
    private readonly conversationRepository: ConversationRepository,
  ) {}

  async uploadImage(
    userId: string,
    conversationId: string,
    file: Express.Multer.File,
  ): Promise<UploadResult> {
    const conversation = await this.conversationRepository.findOne({
      userId,
      id: conversationId,
    });

    if (!conversation) {
      throw AiAdvisorErrorFactory.conversationNotFound();
    }

    return this.storageService.uploadImage(file, {
      bucketName: ConversationManagerService.CONVERSATION_IMAGES_BUCKET,
      folder: `${userId}/${conversationId}`,
    });
  }
}
