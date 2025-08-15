import { CommonErrorFactory } from '@/common/errors';
import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ImageValidationPipe implements PipeTransform {
  private static readonly ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ];
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  transform(value: Express.Multer.File): Express.Multer.File {
    if (!value) {
      throw new BadRequestException('No file provided');
    }

    if (!ImageValidationPipe.ALLOWED_MIME_TYPES.includes(value.mimetype)) {
      throw CommonErrorFactory.invalidFileType(
        `Invalid file type. Allowed types: ${ImageValidationPipe.ALLOWED_MIME_TYPES.join(', ')}`,
      );
    }

    if (value.size > ImageValidationPipe.MAX_FILE_SIZE) {
      throw CommonErrorFactory.fileSizeExceedsLimit(
        `File size exceeds maximum limit of ${ImageValidationPipe.MAX_FILE_SIZE / (1024 * 1024)}MB`,
      );
    }

    return value;
  }
}
