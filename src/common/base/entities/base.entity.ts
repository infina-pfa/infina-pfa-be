import { v4 as uuid } from 'uuid';
import { OptionalProp } from '@/common/utils/type';
import { BaseValueObject } from '../value-objects/base.value-object';

export type Props<T> = T extends BaseEntity<infer P> ? P : never;

export interface BaseProps {
  createdAt: Date;
  updatedAt: Date;
}

export abstract class BaseEntity<P extends BaseProps> {
  private readonly _id: string;
  protected _props: P;

  constructor(props?: OptionalProp<P, 'createdAt' | 'updatedAt'>, id?: string) {
    this._id = id ?? uuid();
    this._props = {
      ...props,
      createdAt: props?.createdAt ?? new Date(),
      updatedAt: props?.updatedAt ?? new Date(),
    } as P;
  }

  abstract validate(): void;

  public get id(): string {
    return this._id;
  }

  public get props(): Readonly<P> {
    return Object.freeze(this._props);
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }

  public get updatedAt(): Date {
    return this.props.updatedAt;
  }

  update(props: Omit<Partial<P>, 'createdAt' | 'updatedAt' | 'userId'>): void {
    this._props = {
      ...this._props,
      ...props,
    } as P;
  }

  public updated() {
    this._props.updatedAt = new Date();
  }

  public equals(other?: BaseEntity<P>): boolean {
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
