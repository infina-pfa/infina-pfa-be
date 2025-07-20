import { BaseEntity, BaseProps } from '@/common/entities/base.entity';

export enum BudgetCategory {
  FIXED = 'fixed',
  FLEXIBLE = 'flexible',
}

export interface BudgetEntityProps extends BaseProps {
  name: string;
  amount: number;
  userId: string;
  category: BudgetCategory;
  color: string;
  icon: string;
  month: number;
  year: number;
}

export class BudgetEntity extends BaseEntity<BudgetEntityProps> {
  public static create(
    props: Omit<BudgetEntityProps, 'id'>,
    id?: string,
  ): BudgetEntity {
    return new BudgetEntity(
      {
        ...props,
      },
      id,
    );
  }
}
