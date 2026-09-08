import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
export interface ApiEnvelope<T> {
    success: true;
    code: 0;
    message: 'OK';
    data: T;
}
export declare class ApiResponseInterceptor<T> implements NestInterceptor<T, ApiEnvelope<T>> {
    intercept(_context: ExecutionContext, next: CallHandler<T>): Observable<ApiEnvelope<T>>;
}
