import { Email, Password } from '@/common';

export abstract class AuthService {
  abstract signUpWithEmail(email: Email, password: Password): Promise<void>;
  abstract signInWithEmail(email: Email, password: Password): Promise<void>;
}
