import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UploadImageDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Image file to upload (JPEG, PNG, GIF, or WebP, max 10MB)',
  })
  @IsNotEmpty()
  image: Express.Multer.File;
}

export class UploadImageResponseDto {
  @ApiProperty({
    description: 'Name of the uploaded file',
    example: 'image_1234567890.jpg',
  })
  fileName: string;

  @ApiProperty({
    description: 'Path where the file is stored',
    example: 'conversations/conv_123/image_1234567890.jpg',
  })
  filePath: string;

  @ApiProperty({
    description: 'Public URL to access the uploaded image',
    example:
      'https://storage.example.com/conversations/conv_123/image_1234567890.jpg',
  })
  publicUrl: string;

  @ApiProperty({
    description: 'Size of the uploaded file in bytes',
    example: 1024000,
  })
  size: number;

  @ApiProperty({
    description: 'MIME type of the uploaded file',
    example: 'image/jpeg',
  })
  mimeType: string;
}
