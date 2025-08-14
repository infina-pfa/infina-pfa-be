export type UserFinancialAction = {
  pyf: {
    doneAt: Date | null;
    reasonNotPyf: string | null;
    reminderDate: Date | null;
  };
  recordSpending: {
    recorded: boolean;
    lastRecordedAt: Date | null;
  };
  setupNextBudget: boolean;
};
