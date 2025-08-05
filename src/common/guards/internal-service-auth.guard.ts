import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { CommonErrorFactory } from '../errors';

@Injectable()
export class InternalServiceAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);
    console.log('🚀 ~ InternalServiceAuthGuard ~ canActivate ~ token:', token);

    if (!token) {
      throw CommonErrorFactory.unauthorizedNoToken();
    }

    return token === process.env.INTERNAL_API_KEY;
  }

  private extractTokenFromHeader(request: Request): string | null {
    const authHeader = request.headers['x-api-key'];
    if (!authHeader) {
      return null;
    }

    return authHeader as string;
  }
}
