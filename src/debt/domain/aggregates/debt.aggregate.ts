import { BaseEntity, BaseProps, CurrencyVO } from '@/common/base';
import { DebtEntity, DebtPaymentEntity, DebtType } from '../entities';
import { DebtPaymentWatchList } from '../watch-list/debt-payment.watch-list';

export interface DebtAggregateProps {
  debt: DebtEntity;
  payments: DebtPaymentWatchList;
}

export class DebtAggregate extends BaseEntity<DebtAggregateProps & BaseProps> {
  public static create(props: DebtAggregateProps, id?: string): DebtAggregate {
    return new DebtAggregate(
      {
        ...props,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      id,
    );
  }

  public validate(): void {
    this.props.debt.validate();
    this.props.payments.items.forEach((payment) => {
      payment.validate();
    });
  }

  public get userId(): string {
    return this.props.debt.userId;
  }

  public get payments(): DebtPaymentWatchList {
    return this.props.payments;
  }

  public get amount(): CurrencyVO {
    return this.props.debt.amount;
  }

  public get currentPaidAmount(): CurrencyVO {
    return this.props.payments.items.reduce((acc, payment) => {
      return acc.add(payment.amount);
    }, new CurrencyVO(0));
  }

  public get dueDate(): Date {
    return this.props.debt.dueDate;
  }

  public get rate(): number {
    return this.props.debt.rate;
  }

  public static newDebt(
    userId: string,
    props: {
      amount: CurrencyVO;
      lender: string;
      purpose: string;
      rate: number;
      dueDate: Date;
      currentPaidAmount: CurrencyVO;
      type: DebtType;
    },
  ): DebtAggregate {
    const debt = DebtEntity.create({
      userId,
      ...props,
    });

    const debtAggregate = DebtAggregate.create({
      debt,
      payments: new DebtPaymentWatchList([]),
    });

    if (props.currentPaidAmount.value > 0) {
      const payment = DebtPaymentEntity.create({
        userId,
        amount: props.currentPaidAmount,
        recurring: 0,
        name: 'Nợ đã trả',
        description: 'Đã trả số tiền nợ',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      debtAggregate.payments.add(payment);
    }

    return debtAggregate;
  }

  public pay(amount: CurrencyVO, name?: string, description?: string): void {
    this._props.payments.add(
      DebtPaymentEntity.create({
        userId: this.userId,
        amount,
        name: `Trả nợ cho ${this._props.debt.lender}`,
        description,
        recurring: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );
  }

  public removePayment(debtPaymentId: string): void {
    this._props.payments.remove(
      this._props.payments.items.find(
        (payment) => payment.id === debtPaymentId,
      )!,
    );
  }
}
