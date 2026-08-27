import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const request = host.switchToHttp().getRequest<Request>();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const details = exception instanceof HttpException ? exception.getResponse() : undefined;
    const message = typeof details === 'string'
      ? details
      : typeof details === 'object' && details !== null && 'message' in details
        ? String(Array.isArray(details.message) ? details.message.join(', ') : details.message)
        : 'サーバーエラーが発生しました';
    response.status(status).json({ success: false, code: status, message, data: null, path: request.url });
  }
}
