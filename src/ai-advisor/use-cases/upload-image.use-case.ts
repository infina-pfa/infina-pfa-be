import { BaseUseCase } from '@/common/base/use-case/base.use-case';
import { UploadResult } from '@/common/storage';
import { Injectable } from '@nestjs/common';
import { ConversationManagerService } from '../domain';

export interface UploadImageUseCaseInput {
  conversationId: string;
  file: Express.Multer.File;
  userId: string;
}

@Injectable()
export class UploadImageUseCase extends BaseUseCase<
  UploadImageUseCaseInput,
  UploadResult
> {
  constructor(
    private readonly conversationManagerService: ConversationManagerService,
  ) {
    super();
  }

  async execute(input: UploadImageUseCaseInput): Promise<UploadResult> {
    return this.conversationManagerService.uploadImage(
      input.userId,
      input.conversationId,
      input.file,
    );
  }
}
