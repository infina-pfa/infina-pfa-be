import { BaseRepository } from '@/common/base/repositories/base.repository';
import { ConversationEntity } from '../entities/conversation.entity';

export abstract class ConversationRepository extends BaseRepository<ConversationEntity> {}
