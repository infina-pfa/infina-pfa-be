export type DebtDetails = {
  rate: number;
  dueDate: string;
  amount: number;
  currentPaidAmount: number;
};

export function calculateMonthlyPayment(debts: DebtDetails): number {
  const { amount, rate, dueDate, currentPaidAmount } = debts;
  const today = new Date();
  const timeDiff = new Date(dueDate).getTime() - today.getTime();
  const timeDiffInMonths = Math.ceil(timeDiff / (1000 * 60 * 60 * 24 * 30));

  if (rate === 0) {
    return timeDiffInMonths === 0
      ? amount - currentPaidAmount
      : (amount - currentPaidAmount) / timeDiffInMonths;
  }

  return (
    ((amount - currentPaidAmount) * (rate / 100)) /
    (1 - Math.pow(1 + rate / 100, -timeDiffInMonths))
  );
}
