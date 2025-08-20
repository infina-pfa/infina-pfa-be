import { BaseEntity, BaseProps, CurrencyVO } from '@/common/base';
import { OptionalProp } from '@/common/utils/type';
import { TransactionType } from '@/common/types/transaction';

export interface DebtPaymentEntityProps extends BaseProps {
  userId: string;
  amount: CurrencyVO;
  recurring: number;
  name: string;
  description: string;
  type: TransactionType;
  deletedAt?: Date | null;
}

export class DebtPaymentEntity extends BaseEntity<DebtPaymentEntityProps> {
  public static create(
    props: OptionalProp<
      Omit<DebtPaymentEntityProps, 'type'>,
      'createdAt' | 'updatedAt' | 'deletedAt'
    >,
    id?: string,
  ): DebtPaymentEntity {
    return new DebtPaymentEntity(
      {
        ...props,
        deletedAt: props.deletedAt ?? null,
        type: TransactionType.DEBT_PAYMENT,
      },
      id,
    );
  }

  public validate(): void {
    if (this.props.amount.value <= 0) {
      throw new Error('Invalid amount');
    }
  }

  public get amount(): CurrencyVO {
    return this.props.amount;
  }
}
