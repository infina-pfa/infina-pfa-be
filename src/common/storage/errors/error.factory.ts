import { BadRequestException, NotFoundException } from '@nestjs/common';
import { StorageErrorCode } from './error-code';

export class StorageErrorFactory {
  static bucketNotFound(message: string): NotFoundException {
    return new NotFoundException({
      code: StorageErrorCode.BUCKET_NOT_FOUND,
      message,
    });
  }

  static fileNotFound(message: string): NotFoundException {
    return new NotFoundException({
      code: StorageErrorCode.FILE_NOT_FOUND,
      message,
    });
  }

  static fileDeletionFailed(message: string): BadRequestException {
    return new BadRequestException({
      code: StorageErrorCode.FILE_DELETION_FAILED,
      message,
    });
  }

  static fileUploadFailed(message?: string): BadRequestException {
    return new BadRequestException({
      code: StorageErrorCode.FILE_UPLOAD_FAILED,
      message: message || 'File upload failed',
    });
  }
}
