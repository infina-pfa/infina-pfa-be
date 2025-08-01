import { Currency } from '@/common/types/user';
import { BaseValueObject } from './base.value-object';
import { CommonErrorFactory } from '@/common/errors';

interface CurrencyProps {
  value: number;
  currency: Currency;
}

export class CurrencyVO extends BaseValueObject<CurrencyProps> {
  constructor(value: number, currency?: Currency) {
    super({ value, currency: currency ?? Currency.VND });
  }

  public get value(): number {
    return this._value.value;
  }

  public get currency(): Currency {
    return this._value.currency;
  }

  public add(other: CurrencyVO): CurrencyVO {
    if (this.currency !== other.currency) {
      throw CommonErrorFactory.currencyMismatch();
    }
    return new CurrencyVO(this.value + other.value, this.currency);
  }

  public subtract(other: CurrencyVO): CurrencyVO {
    if (this.currency !== other.currency) {
      throw CommonErrorFactory.currencyMismatch();
    }
    return new CurrencyVO(this.value - other.value, this.currency);
  }

  public multiply(factor: number): CurrencyVO {
    return new CurrencyVO(this.value * factor, this.currency);
  }

  public divide(divisor: number): CurrencyVO {
    return new CurrencyVO(this.value / divisor, this.currency);
  }

  public equals(other: CurrencyVO): boolean {
    return this.value === other.value && this.currency === other.currency;
  }
}
