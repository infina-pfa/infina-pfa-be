import { MessageRepository } from '@/ai-advisor/domain/repositories/message.repository';
import { PrismaClient } from '@/common/prisma';
import { MessagePrismaRepository } from '@/common/prisma/repositories/message-prisma.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MessageRepositoryImpl
  extends MessagePrismaRepository
  implements MessageRepository
{
  constructor(private readonly prismaClient: PrismaClient) {
    super(prismaClient);
  }
}
