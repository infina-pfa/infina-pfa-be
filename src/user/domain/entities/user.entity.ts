import { BaseEntity, BaseProps } from '@/common/base';
import { Currency, Language } from '@/common/types/user';
import { UserErrorFactory } from '../errors/user-error.factory';
import { OptionalProps } from '@/common/utils';

export enum FinancialStage {
  DEBT = 'debt',
  START_SAVING = 'start_saving',
  START_INVESTING = 'start_investing',
}

export interface UserEntityProps extends BaseProps {
  name: string;
  userId: string;
  financialStage: FinancialStage | null;
  currency: Currency;
  language: Language;
  deletedAt: Date | null;
}

export class UserEntity extends BaseEntity<UserEntityProps> {
  public static create(
    props: OptionalProps<
      Omit<UserEntityProps, 'id'>,
      'createdAt' | 'updatedAt' | 'deletedAt'
    >,
    id?: string,
  ): UserEntity {
    return new UserEntity(
      {
        ...props,
        deletedAt: props.deletedAt ?? null,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id,
    );
  }

  public validate(): void {
    if (!this.props.name) {
      throw UserErrorFactory.invalidUser('Name is required');
    }
    if (!Object.values(Currency).includes(this.props.currency)) {
      throw UserErrorFactory.invalidUser('Invalid currency');
    }
    if (!Object.values(Language).includes(this.props.language)) {
      throw UserErrorFactory.invalidUser('Invalid language');
    }
  }

  public updateName(name: string): void {
    this._props.name = name;
    this.updated();
  }

  public setFinancialStage(stage: FinancialStage): void {
    this._props.financialStage = stage;
    this.updated();
  }

  public updateCurrency(currency: Currency): void {
    this._props.currency = currency;
    this.updated();
  }

  public updateLanguage(language: Language): void {
    this._props.language = language;
    this.updated();
  }

  get name(): string {
    return this.props.name;
  }

  get userId(): string {
    return this.props.userId;
  }

  get financialStage(): string | null | undefined {
    return this.props.financialStage;
  }

  get currency(): string {
    return this.props.currency;
  }

  get language(): string {
    return this.props.language;
  }
}
