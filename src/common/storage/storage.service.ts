import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { supabaseClient } from '../base/repositories/supabase-client';
import { StorageErrorFactory } from './errors/error.factory';
import { BucketInfo, UploadResult } from './types/storage.types';
import { CommonErrorFactory } from '../errors';

@Injectable()
export class StorageService {
  private readonly supabase = supabaseClient;
  private static readonly SUPABASE_BUCKET = 'uploads';
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private static readonly ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ];

  async uploadImage(
    file: Express.Multer.File,
    bucketInfo: BucketInfo,
  ): Promise<UploadResult> {
    const {
      bucketName = StorageService.SUPABASE_BUCKET,
      folder = 'images',
      fileName,
    } = bucketInfo;

    if (!StorageService.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw CommonErrorFactory.invalidFileType(file.mimetype);
    }

    if (file.size > StorageService.MAX_FILE_SIZE) {
      throw CommonErrorFactory.fileSizeExceedsLimit(
        `File size exceeds ${StorageService.MAX_FILE_SIZE} limit.`,
      );
    }

    const fileExtension = file.originalname.split('.').pop();
    const uniqueFileName = fileName || `${uuidv4()}.${fileExtension}`;
    const filePath = folder ? `${folder}/${uniqueFileName}` : uniqueFileName;

    try {
      await this.ensureBucketExists(bucketName);

      const { data, error } = await this.supabase.storage
        .from(bucketName)
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (error) {
        throw StorageErrorFactory.fileUploadFailed(error.message);
      }

      const { data: urlData } = this.supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      return {
        fileName: uniqueFileName,
        filePath: data.path,
        publicUrl: urlData.publicUrl,
        size: file.size,
        mimeType: file.mimetype,
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      throw StorageErrorFactory.fileUploadFailed();
    }
  }

  getPublicUrl(bucketName: string, filePath: string): string {
    const { data } = this.supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  private async ensureBucketExists(bucketName: string): Promise<void> {
    const { data: buckets, error: listError } =
      await this.supabase.storage.listBuckets();

    if (listError) {
      throw new InternalServerErrorException(
        `Failed to list buckets: ${listError.message}`,
      );
    }

    const bucketExists = buckets?.some((bucket) => bucket.name === bucketName);

    if (!bucketExists) {
      throw StorageErrorFactory.bucketNotFound(bucketName);
    }
  }
}
