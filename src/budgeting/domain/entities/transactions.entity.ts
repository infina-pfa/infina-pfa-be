import { BaseEntity, BaseProps } from '@/common/entities/base.entity';

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
  TRANSFER = 'transfer',
}

export interface TransactionEntityProps extends BaseProps {
  userId: string;
  amount: number;
  recurring: number;
  name: string;
  description: string;
  type: TransactionType;
}

export class TransactionEntity extends BaseEntity<TransactionEntityProps> {
  public static create(
    props: Omit<TransactionEntityProps, 'id'>,
    id?: string,
  ): TransactionEntity {
    return new TransactionEntity(props, id);
  }
}
