import { BaseEntity, BaseProps, CurrencyVO } from '@/common/base';
import { OptionalProps } from '@/common/utils';

export enum DebtType {
  BAD_DEBT = 'bad_debt',
  GOOD_DEBT = 'good_debt',
}

export type DebtEntityProps = BaseProps & {
  userId: string;
  lender: string;
  purpose: string;
  amount: CurrencyVO;
  rate: number;
  dueDate: Date;
  type: DebtType;
  deletedAt?: Date | null;
};

export class DebtEntity extends BaseEntity<DebtEntityProps> {
  public static create(
    props: OptionalProps<
      DebtEntityProps,
      'createdAt' | 'updatedAt' | 'deletedAt' | 'type'
    >,
    id?: string,
  ): DebtEntity {
    return new DebtEntity(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
        deletedAt: props.deletedAt ?? null,
        type: props.type ?? DebtType.BAD_DEBT,
      },
      id,
    );
  }

  public validate(): void {
    if (!this.props.userId) {
      throw new Error('User ID is required');
    }
  }

  public update(
    props: Partial<
      Omit<DebtEntityProps, 'createdAt' | 'updatedAt' | 'userId' | 'deletedAt'>
    >,
  ): void {
    this._props = {
      ...this._props,
      ...props,
    };

    this.updated();
  }

  public get userId(): string {
    return this.props.userId;
  }

  public get amount(): CurrencyVO {
    return this.props.amount;
  }

  public get rate(): number {
    return this.props.rate;
  }

  public get dueDate(): Date {
    return this.props.dueDate;
  }

  public get lender(): string {
    return this.props.lender;
  }
}
