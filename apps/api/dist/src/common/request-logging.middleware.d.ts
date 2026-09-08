import { type NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import type { AuthUser } from './auth.types';
interface RequestWithUser extends Request {
    user?: AuthUser;
}
export declare class RequestLoggingMiddleware implements NestMiddleware {
    private readonly logger;
    use(request: RequestWithUser, response: Response, next: NextFunction): void;
}
export {};
