import { Inject, Injectable } from '@nestjs/common';
import { AuthService } from '../domain';
import { Email, Password, SUPABASE_CLIENT, SupabaseClient } from '@/common';

@Injectable()
export class AuthServiceImpl implements AuthService {
  constructor(
    @Inject(SUPABASE_CLIENT)
    private readonly supabase: SupabaseClient,
  ) {}

  async signUpWithEmail(email: Email, password: Password): Promise<void> {
    const { error } = await this.supabase.auth.signUp({
      email: email.value,
      password: password.value,
      options: {
        emailRedirectTo: `${process.env.APP_URL}/auth/verify-email`,
      },
    });

    if (error) throw error;
  }

  async signInWithEmail(email: Email, password: Password): Promise<void> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    });

    if (error) throw error;
  }
}
