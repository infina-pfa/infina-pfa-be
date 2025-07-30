import { PrismaModule } from '@/common';
import { Module } from '@nestjs/common';
import { UserController } from '../controllers/user.controller';
import { repositories } from '../infrastructure/repositories';
import { useCases } from '../use-cases';

@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [...repositories, ...useCases],
})
export class UserModule {}
