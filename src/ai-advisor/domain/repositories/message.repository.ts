import { BaseRepository } from '@/common/base/repositories/base.repository';
import { MessageEntity } from '../entities/message.entity';

export abstract class MessageRepository extends BaseRepository<MessageEntity> {}
