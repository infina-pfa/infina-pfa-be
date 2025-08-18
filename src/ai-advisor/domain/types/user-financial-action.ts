export type UserFinancialAction = {
  pyf: {
    pyfAmount: number;
    currentPyf: number;
    pyfAt: Date | null;
    reasonNotPyf: string | null;
    reminderDate: Date | null;
  };
  recordSpending: {
    recorded: boolean;
    lastRecordedAt: Date | null;
  };
  setupNextBudget: boolean;
};
