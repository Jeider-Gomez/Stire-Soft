import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
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

    // Unknown exception -> hide details in production
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
