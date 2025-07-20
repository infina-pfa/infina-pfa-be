import { Module } from '@nestjs/common';
import { PrismaModule } from '@/common';
import { repositories } from '../infrastructure/repositories';

@Module({
  imports: [PrismaModule],
  providers: [...repositories],
})
export class UserModule {}
