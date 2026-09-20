import { CallHandler, ExecutionContext, HttpException, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { RequestMetricsService } from './request-metrics.service';

@Injectable()
export class RequestMetricsInterceptor implements NestInterceptor {
  constructor(private readonly metrics: RequestMetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') return next.handle();

    const start = process.hrtime.bigint();
    const elapsedMs = () => Number(process.hrtime.bigint() - start) / 1e6;

    return next.handle().pipe(
      tap({
        next: () => this.metrics.record(elapsedMs(), context.switchToHttp().getResponse().statusCode ?? 200),
        error: (err: unknown) => this.metrics.record(elapsedMs(), err instanceof HttpException ? err.getStatus() : 500),
      }),
    );
  }
}
