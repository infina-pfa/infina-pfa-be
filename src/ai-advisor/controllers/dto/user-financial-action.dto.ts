import { ApiProperty } from '@nestjs/swagger';

export class UserFinancialActionDto {
  @ApiProperty({
    description: 'The PYF information',
    type: Object,
  })
  pyf: {
    doneAt: Date | null;
    reasonNotPyf: string | null;
    reminderDate: Date | null;
  };

  @ApiProperty({
    description: 'The record spending information',
    type: Object,
  })
  recordSpending: {
    recorded: boolean;
    lastRecordedAt: Date | null;
  };

  @ApiProperty({
    description: 'The setup next budget information',
    type: Boolean,
  })
  setupNextBudget: boolean;
}
