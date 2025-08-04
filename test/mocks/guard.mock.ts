import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { AuthTestUtils } from '../utils/auth.utils';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  aud: string;
  role: string;
}

export class MockGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request: Request & { user?: AuthUser } = context
      .switchToHttp()
      .getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return false;
    }

    const token = authHeader.split(' ')[1];
    const { isValid, user } = AuthTestUtils.verifyMockJwtToken(token);
    if (isValid && user) {
      request.user = {
        id: user.sub,
        email: user.user_metadata.email,
        name: user.user_metadata.name,
        aud: 'test',
        role: 'test',
      };
      return true;
    }

    return false;
  }
}
