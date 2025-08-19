import { GoalManagerService } from '@/onboarding/domain/services';
import { CurrencyVO } from '@/common/base';
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@/common/prisma';

@Injectable()
export class GoalManagerServiceImpl extends GoalManagerService {
  constructor(private readonly prismaClient: PrismaClient) {
    super();
  }

  async createEmergencyFundGoal(
    userId: string,
    dueDate: Date,
    amount: CurrencyVO,
  ): Promise<void> {
    await this.prismaClient.goals.create({
      data: {
        user_id: userId,
        title: 'Quỹ dự phòng',
        type: 'emergency',
        target_amount: amount.value,
        due_date: dueDate,
      },
    });
  }
}
