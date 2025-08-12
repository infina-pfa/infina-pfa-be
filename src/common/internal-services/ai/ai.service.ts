import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { Readable } from 'stream';
import { AiStreamFlowType } from './request.type';

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

  async stream(
    userId: string,
    message: string,
    conversationId: string,
    flowType: AiStreamFlowType,
    callbacks?: {
      onData?: (chunk: Buffer) => void;
      onEnd?: () => void;
      onError?: (error: Error) => void;
    },
  ): Promise<void> {
    this.logger.log(
      `Streaming message to AI service: ${JSON.stringify({
        userId,
        conversationId,
        flowType,
      })}`,
    );

    const response = await this.client.post(
      '/v2/chat/stream',
      {
        user_id: userId,
        user_message: message,
        conversation_id: conversationId,
        flow_type: flowType,
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
    }>(`/v1/chat/start-message/${userId}`);

    if (!response.data.success) {
      throw new Error('Failed to get start message');
    }

    return response.data.data.startMessage;
  }
}
