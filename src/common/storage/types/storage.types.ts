export interface BucketInfo {
  bucketName: string;
  folder?: string;
  fileName?: string;
}

export interface UploadResult {
  fileName: string;
  filePath: string;
  publicUrl: string;
  size: number;
  mimeType: string;
}

export interface StorageConfig {
  defaultBucket: string;
  maxFileSize: number;
  allowedMimeTypes: string[];
}
