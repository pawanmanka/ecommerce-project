import { UnauthorizedException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { ExecutionContext } from '@nestjs/common';
import { SignJWT } from 'jose';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import type { AuthenticatedRequest } from './authenticated-request.js';

const secret = 'this-is-a-test-secret-with-at-least-32-characters';
const userId = '9d37b202-045e-41dc-a5ba-10449cb05aa1';

function createContext(authorization?: string): ExecutionContext {
  const request = {
    headers: authorization ? { authorization } : {},
  } as AuthenticatedRequest;

  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
    request,
  } as unknown as ExecutionContext;
}

function createGuard(jwtSecret = secret): JwtAuthGuard {
  return new JwtAuthGuard({
    getOrThrow: () => jwtSecret,
  } as ConfigService);
}

async function signToken(
  jwtSecret = secret,
  subject = userId,
  expiration: string | number = '5m',
): Promise<string> {
  return new SignJWT({ email: 'person@example.com' })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(subject)
    .setExpirationTime(expiration)
    .sign(new TextEncoder().encode(jwtSecret));
}

describe('JwtAuthGuard', () => {
  it('accepts a valid auth-service token and sets its user claims', async () => {
    const token = await signToken();
    const context = createContext(`Bearer ${token}`);

    await expect(createGuard().canActivate(context)).resolves.toBe(true);
    expect(context.request.authUser).toEqual({
      sub: userId,
      email: 'person@example.com',
    });
  });

  it('rejects a missing bearer token', async () => {
    await expect(
      createGuard().canActivate(createContext()),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects invalid, expired, and malformed-subject tokens', async () => {
    const invalidSignatureToken = await signToken(
      'a-different-secret-with-more-than-32-characters',
    );
    const expiredToken = await signToken(secret, userId, -1);
    const malformedSubjectToken = await signToken(secret, 'not-a-uuid');

    for (const token of [
      invalidSignatureToken,
      expiredToken,
      malformedSubjectToken,
    ]) {
      await expect(
        createGuard().canActivate(createContext(`Bearer ${token}`)),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    }
  });
});
