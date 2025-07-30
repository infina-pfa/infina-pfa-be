import { CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthTestUtils, TEST_USERS } from '../utils/auth.utils';
import { User } from '@supabase/supabase-js';
import { Request } from 'express';

export class MockGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request: Request & { user?: User } = context
      .switchToHttp()
      .getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return false;
    }

    const token = authHeader.split(' ')[1];
    const mockUsers = Object.values(TEST_USERS);
    const user = mockUsers.find((u) => token.includes(u.id ?? ''));

    if (user) {
      request.user = AuthTestUtils.createMockSupabaseUser(user);
      return true;
    }

    return false;
  }
}
