import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, user } = request;
    const userId = user?.id || 'anonymous';

    // Omitir logging de payloads en rutas de auth o logs masivos
    const isSensitive = url.includes('/auth') || url.includes('/login');
    const payload = isSensitive ? '***' : JSON.stringify(body);

    const now = Date.now();
    return next.handle().pipe(
      tap(() => {
        if (method !== 'GET') {
          this.logger.log(`[AUDIT] ${method} ${url} | User: ${userId} | Payload: ${payload} | ${Date.now() - now}ms`);
        }
      }),
    );
  }
}
