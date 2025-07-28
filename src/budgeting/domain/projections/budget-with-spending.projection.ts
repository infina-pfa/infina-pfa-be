import { BudgetEntity } from '../entities/budget.entity';

export interface BudgetWithSpendingProjectionProps {
  budget: BudgetEntity;
  totalSpent: number;
  transactionCount: number;
  remainingAmount: number;
  spentPercentage: number;
}

export class BudgetWithSpendingProjection {
  public readonly budget: BudgetEntity;
  public readonly totalSpent: number;
  public readonly transactionCount: number;
  public readonly remainingAmount: number;
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
    totalSpent: number,
    transactionCount: number,
  ): BudgetWithSpendingProjection {
    const budgetAmount = budget.props.amount;
    const remainingAmount = budgetAmount - totalSpent;
    const spentPercentage =
      budgetAmount > 0 ? (totalSpent / budgetAmount) * 100 : 0;

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
      totalSpent: this.totalSpent,
      transactionCount: this.transactionCount,
      remainingAmount: this.remainingAmount,
      spentPercentage: this.spentPercentage,
    };
  }
}
