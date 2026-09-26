import type { INestApplication } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

const DEFAULT_DEV_ORIGINS = ['http://localhost:5173', 'http://localhost:3000'];

/** Orígenes permitidos: CORS_ORIGIN separado por comas; en desarrollo, los del frontend local. */
export function parseAllowedOrigins(corsOriginEnv: string | undefined): string[] {
  const list = (corsOriginEnv ?? '').split(',').map((o) => o.trim()).filter(Boolean);
  return list.length > 0 ? list : DEFAULT_DEV_ORIGINS;
}

/**
 * CORS del backend. Un origen ajeno se rechaza con 403 antes de llegar a los controladores (también un POST
 * directo, no solo la verificación previa del navegador). Antes el rechazo se hacía pasando un Error a la
 * librería `cors`, y ese error terminaba como 500 («error interno»): no decía la verdad y ensuciaba los
 * registros. Las peticiones sin cabecera Origin (curl, la app móvil, el propio servidor) pasan.
 */
export function applyCors(app: INestApplication, allowedOrigins: string[]): void {
  app.use((req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin;
    if (origin && !allowedOrigins.includes(origin)) {
      res.status(403).json({ statusCode: 403, error: 'Origen no permitido' });
      return;
    }
    next();
  });
  app.enableCors({
    origin: (origin, callback) => callback(null, !origin || allowedOrigins.includes(origin)),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
}
