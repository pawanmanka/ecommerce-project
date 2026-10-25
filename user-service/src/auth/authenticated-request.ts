import type { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  authUser: {
    sub: string;
    email?: string;
  };
}
