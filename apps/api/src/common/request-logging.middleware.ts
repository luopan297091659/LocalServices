import { Injectable, Logger, type NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import type { AuthUser } from './auth.types';

interface RequestWithUser extends Request { user?: AuthUser }

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(request: RequestWithUser, response: Response, next: NextFunction): void {
    const incomingId = request.header('x-request-id');
    const requestId = incomingId && /^[A-Za-z0-9._-]{1,128}$/.test(incomingId) ? incomingId : randomUUID();
    const startedAt = performance.now();
    response.setHeader('x-request-id', requestId);
    response.once('finish', () => {
      this.logger.log(JSON.stringify({
        requestId,
        userId: request.user?.sub,
        method: request.method,
        path: request.path,
        status: response.statusCode,
        durationMs: Number((performance.now() - startedAt).toFixed(1)),
      }));
    });
    next();
  }
}
