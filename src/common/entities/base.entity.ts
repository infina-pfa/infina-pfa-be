import { v4 as uuid } from 'uuid';
import { BaseValueObject } from '../value-objects/base.value-object';

export interface BaseProps {
  createdAt: Date;
  updatedAt: Date;
}

export abstract class BaseEntity<Props extends BaseProps> {
  private readonly _id: string;
  protected _props: Props;

  constructor(
    props?: Omit<Props, 'id' | 'createdAt' | 'updatedAt'>,
    id?: string,
  ) {
    this._id = id ?? uuid();
    this._props = {
      ...props,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Props;
  }

  public get id(): string {
    return this._id;
  }

  public get props(): Readonly<Props> {
    return Object.freeze(this._props);
  }

  public updated() {
    this._props.updatedAt = new Date();
  }

  public equals(other?: BaseEntity<Props>): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    if (this === other) {
      return true;
    }
    if (!(other instanceof BaseEntity)) {
      return false;
    }
    return this._id === other._id;
  }

  public toObject(): any {
    const result: Record<string, unknown> = {};
    result.id = this.id;
    Object.keys(this.props).forEach((key) => {
      if (Array.isArray(this.props[key])) {
        result[key] = this.props[key].map((item: unknown) => {
          if (item instanceof BaseValueObject) {
            return item.toObject();
          }
          return item;
        });
      } else if (
        this.props[key] instanceof BaseValueObject ||
        this.props[key] instanceof BaseEntity
      ) {
        result[key] = this.props[key].toObject();
      } else {
        result[key] = this.props[key];
      }
    });
    return result;
  }
}
