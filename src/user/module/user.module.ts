import { PrismaModule } from '@/common/prisma';
import { Module } from '@nestjs/common';
import { UserController } from '../controllers/user.controller';
import { repositories } from '../infrastructure/repositories';
import { useCases } from '../use-cases';
import { userServices } from '../infrastructure/services';
import { WebhookController } from '../controllers/webhook.controller';

@Module({
  imports: [PrismaModule],
  controllers: [UserController, WebhookController],
  providers: [...repositories, ...useCases, ...userServices],
})
export class UserModule {}
