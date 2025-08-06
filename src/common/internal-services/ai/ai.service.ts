import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { Readable } from 'stream';
import { AiStreamConversationMessage, AiStreamFlowType } from './request.type';

@Injectable()
export class AiInternalService {
  private static readonly BASE_URL = process.env.AI_SERVICE_URL;
  private static readonly API_KEY = process.env.AI_SERVICE_API_KEY;
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${AiInternalService.BASE_URL}/api/v1`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${AiInternalService.API_KEY}`,
      },
    });
  }

  async stream(
    userId: string,
    message: string,
    history: AiStreamConversationMessage[],
    flowType: AiStreamFlowType,
    callbacks?: {
      onData?: (chunk: Buffer) => void;
      onEnd?: () => void;
      onError?: (error: Error) => void;
    },
  ): Promise<void> {
    const response = await this.client.post(
      '/chat/stream',
      {
        user_id: userId,
        user_message: message,
        conversation_history: history,
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
}
