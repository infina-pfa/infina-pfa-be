/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { BaseValueObject } from '@/common';
import * as bcrypt from 'bcrypt';
import { z } from 'zod';

const PasswordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters long');

const HashedPasswordSchema = z.string().min(1, 'Password hash cannot be empty');

export class Password extends BaseValueObject<string> {
  private static readonly SALT_ROUNDS = 12;

  constructor(hashedPassword: string) {
    const validatedHash = HashedPasswordSchema.parse(hashedPassword);
    super(validatedHash);
  }

  public static async createFromPlainText(
    plainPassword: string,
  ): Promise<Password> {
    const validatedPassword = PasswordSchema.parse(plainPassword);

    const hashedPassword: string = (await bcrypt.hash(
      validatedPassword,
      Password.SALT_ROUNDS,
    )) as string;
    return new Password(hashedPassword);
  }

  public static createFromHash(hashedPassword: string): Password {
    return new Password(hashedPassword);
  }

  public async compare(plainPassword: string): Promise<boolean> {
    return (await bcrypt.compare(plainPassword, this._value)) as boolean;
  }

  public getHash(): string {
    return this._value;
  }
}
