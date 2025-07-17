export class BaseValueObject<T> {
  protected readonly _value: T;

  constructor(value: T) {
    this._value = value;
  }

  public get value(): T {
    return this._value;
  }

  public equals(other: BaseValueObject<T>): boolean {
    return JSON.stringify(this) === JSON.stringify(other);
  }

  public toString(): string {
    return JSON.stringify(this);
  }

  public toObject(): Record<string, unknown> {
    return {
      value: this._value,
    };
  }
}
