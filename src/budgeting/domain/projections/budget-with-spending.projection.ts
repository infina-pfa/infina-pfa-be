import { BudgetEntity } from '../entities/budget.entity';
import { CurrencyVO } from '@/common/value-objects';

export interface BudgetWithSpendingProjectionProps {
  budget: BudgetEntity;
  totalSpent: CurrencyVO;
  transactionCount: number;
  remainingAmount: CurrencyVO;
  spentPercentage: number;
}

export class BudgetWithSpendingProjection {
  public readonly budget: BudgetEntity;
  public readonly totalSpent: CurrencyVO;
  public readonly transactionCount: number;
  public readonly remainingAmount: CurrencyVO;
  public readonly spentPercentage: number;

  constructor(props: BudgetWithSpendingProjectionProps) {
    this.budget = props.budget;
    this.totalSpent = props.totalSpent;
    this.transactionCount = props.transactionCount;
    this.remainingAmount = props.remainingAmount;
    this.spentPercentage = props.spentPercentage;
  }

  public static create(
    budget: BudgetEntity,
    totalSpent: CurrencyVO,
    transactionCount: number,
  ): BudgetWithSpendingProjection {
    const budgetAmount = budget.props.amount;
    const remainingAmount = budgetAmount.subtract(totalSpent);
    const spentPercentage =
      budgetAmount.value > 0
        ? (totalSpent.value / budgetAmount.value) * 100
        : 0;

    return new BudgetWithSpendingProjection({
      budget,
      totalSpent,
      transactionCount,
      remainingAmount,
      spentPercentage: Math.round(spentPercentage * 100) / 100, // Round to 2 decimal places
    });
  }

  public toObject(): any {
    return {
      ...this.budget.toObject(),
      totalSpent: this.totalSpent.value,
      transactionCount: this.transactionCount,
      remainingAmount: this.remainingAmount.value,
      spentPercentage: this.spentPercentage,
    };
  }
}
