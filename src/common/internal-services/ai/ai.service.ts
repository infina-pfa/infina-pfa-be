import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { Readable } from 'stream';
import { AiStreamFlowType, AiStreamImage } from './request.type';

@Injectable()
export class AiInternalService {
  private static readonly BASE_URL = process.env.AI_SERVICE_URL;
  private static readonly API_KEY = process.env.AI_SERVICE_API_KEY;
  private readonly client: AxiosInstance;
  private readonly logger: Logger;

  constructor() {
    this.client = axios.create({
      baseURL: `${AiInternalService.BASE_URL}/api`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${AiInternalService.API_KEY}`,
      },
    });

    this.logger = new Logger(AiInternalService.name);
  }

  async fetchImagesAsBase64(imageUrls: string[]): Promise<AiStreamImage[]> {
    const images: AiStreamImage[] = [];

    for (const url of imageUrls) {
      try {
        this.logger.log(`Fetching image from URL: ${url}`);

        // Fetch the image
        const response = await axios.get<Buffer>(url, {
          responseType: 'arraybuffer',
          timeout: 30000, // 30 second timeout
        });

        // Get the content type
        const contentType =
          (response.headers['content-type'] as string) || 'image/jpeg';

        // Convert to base64
        const base64Data = Buffer.from(response.data).toString('base64');

        images.push({
          type: 'base64',
          data: base64Data,
          detail: 'auto',
          mime_type: contentType,
        });

        this.logger.log(`Successfully converted image to base64: ${url}`);
      } catch (error) {
        this.logger.error(
          `Failed to fetch image from ${url}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
        // Continue with other images even if one fails
      }
    }

    return images;
  }

  async stream(
    userId: string,
    data: {
      message: string;
      conversationId: string;
      flowType: AiStreamFlowType;
      images?: string[];
    },
    callbacks?: {
      onData?: (chunk: Buffer) => void;
      onEnd?: () => void;
      onError?: (error: Error) => void;
    },
  ): Promise<void> {
    const { message, conversationId, flowType, images: imageUrls } = data;
    this.logger.log(
      `Streaming message to AI service: ${JSON.stringify({
        userId,
        conversationId,
        flowType,
        imageUrls,
      })}`,
    );

    // Convert image URLs to base64 if provided
    let images: AiStreamImage[] = [];
    if (imageUrls && imageUrls.length > 0) {
      images = await this.fetchImagesAsBase64(imageUrls);
    }

    const response = await this.client.post(
      '/v2/chat/stream',
      {
        user_id: userId,
        user_message: message,
        conversation_id: conversationId,
        flow_type: flowType,
        images,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        responseType: 'stream',
      },
    );

    // Convert Node.js Readable stream to Web API ReadableStream
    const nodeStream = response.data as Readable;

    nodeStream.on('data', (chunk: Buffer) => {
      callbacks?.onData?.(chunk);
    });

    nodeStream.on('end', () => {
      callbacks?.onEnd?.();
    });

    nodeStream.on('error', (error: Error) => {
      callbacks?.onError?.(error);
    });
  }

  async getStartMessage(userId: string): Promise<string> {
    this.logger.log(`Getting start message for user: ${userId}`);
    const response = await this.client.get<{
      success: boolean;
      data: { startMessage: string };
    }>(`/v1/start-message/${userId}`);

    if (!response.data.success) {
      throw new Error('Failed to get start message');
    }

    return response.data.data.startMessage;
  }
}
