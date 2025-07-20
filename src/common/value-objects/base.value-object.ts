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
    const result: Record<string, unknown> = {};
    if (Array.isArray(this._value)) {
      result.value = this._value.map((item: unknown) => {
        if (item instanceof BaseValueObject) {
          return item.toObject();
        }
        return item;
      });
    } else if (this._value instanceof BaseValueObject) {
      result.value = this._value.toObject();
    } else {
      result.value = this._value;
    }
    return result;
  }
}
