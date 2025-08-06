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
  ): Promise<ReadableStream> {
    const response = await this.client.post(
      '/chat/stream',
      {
        user_id: userId,
        user_message: message,
        conversation_history: history,
        flow_type: flowType,
      },
      {
        responseType: 'stream',
      },
    );

    // Convert Node.js Readable stream to Web API ReadableStream
    const nodeStream = response.data as Readable;

    return new ReadableStream({
      start(controller) {
        nodeStream.on('data', (chunk: Buffer) => {
          controller.enqueue(new Uint8Array(chunk));
        });

        nodeStream.on('end', () => {
          controller.close();
        });

        nodeStream.on('error', (error: Error) => {
          controller.error(error);
        });
      },
    });
  }
}
