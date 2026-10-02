import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('Errores');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const resBody = exception.getResponse();
      const message = typeof resBody === 'string' ? resBody : (resBody as any).message || resBody;
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        error: message,
      });
      return;
    }

    // Unknown exception -> hide details in production, pero dejarlo en el registro: antes se perdía sin rastro y un
    // 500 no se podía diagnosticar desde el servidor (reporte de Jorge, 02/10).
    this.logger.error(`${request.method} ${request.url}: ${(exception as Error)?.message ?? String(exception)}`, (exception as Error)?.stack);
    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    const isProd = process.env.NODE_ENV === 'production';
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      error: isProd ? 'Internal server error' : (exception as any)?.message || String(exception),
    });
  }
}
