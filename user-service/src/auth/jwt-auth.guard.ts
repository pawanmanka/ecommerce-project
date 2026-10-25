import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { jwtVerify } from 'jose';
import type { AuthenticatedRequest } from './authenticated-request.js';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly secret: Uint8Array;

  constructor(config: ConfigService) {
    const secret = config.getOrThrow<string>('JWT_SECRET');
    if (secret.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters long');
    }
    this.secret = new TextEncoder().encode(secret);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorization = request.headers.authorization;
    const match =
      typeof authorization === 'string'
        ? /^Bearer\s+(\S+)$/i.exec(authorization)
        : null;
    if (!match) {
      throw new UnauthorizedException('A valid Bearer token is required');
    }

    try {
      const { payload } = await jwtVerify(match[1], this.secret, {
        algorithms: ['HS256'],
      });
      if (
        typeof payload.sub !== 'string' ||
        !/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(payload.sub)
      ) {
        throw new UnauthorizedException('The access token is invalid');
      }
      request.authUser = {
        sub: payload.sub,
        ...(typeof payload.email === 'string' && { email: payload.email }),
      };
      return true;
    } catch {
      throw new UnauthorizedException('The access token is invalid or expired');
    }
  }
}
