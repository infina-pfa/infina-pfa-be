import { BaseValueObject } from '@/common';
import { z } from 'zod';

const EmailSchema = z.string().email().min(1, 'Email cannot be empty');

export class Email extends BaseValueObject<string> {
  constructor(value: string) {
    const normalizedEmail = value.toLowerCase().trim();
    const validatedEmail = EmailSchema.parse(normalizedEmail);
    super(validatedEmail);
  }

  public static create(value: string): Email {
    return new Email(value);
  }

  public getDomain(): string {
    return this._value.split('@')[1];
  }

  public getLocalPart(): string {
    return this._value.split('@')[0];
  }
}
