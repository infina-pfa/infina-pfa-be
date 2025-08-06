import { ConversationRepository } from '@/ai-advisor/domain/repositories/conversation.repository';
import { PrismaClient } from '@/common/prisma';
import { ConversationPrismaRepository } from '@/common/prisma/repositories/conversation-prisma.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ConversationRepositoryImpl
  extends ConversationPrismaRepository
  implements ConversationRepository
{
  constructor(private readonly prismaClient: PrismaClient) {
    super(prismaClient);
  }
}
