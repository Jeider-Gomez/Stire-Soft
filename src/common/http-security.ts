import { INestApplication } from '@nestjs/common';
import helmet from 'helmet';

/**
 * Swagger (`/docs`) documenta cada ruta de la API: útil en desarrollo, pero en un servidor
 * accesible públicamente le regala un mapa de ataque a cualquiera. Por defecto solo se
 * publica fuera de producción; `SWAGGER_ENABLED=true|false` lo fuerza en cualquier entorno
 * (por ejemplo, para una demostración desplegada que sí quiera mostrarlo).
 */
export function isSwaggerEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  if (env.SWAGGER_ENABLED === 'true') return true;
  if (env.SWAGGER_ENABLED === 'false') return false;
  return env.NODE_ENV !== 'production';
}

/**
 * Cabeceras de seguridad estándar (X-Content-Type-Options, HSTS, X-Frame-Options,
 * Referrer-Policy, sin X-Powered-By…). La API solo responde JSON, así que la política de
 * contenido por defecto de helmet no estorba; se desactiva únicamente cuando Swagger está
 * publicado, porque su interfaz necesita scripts en línea.
 */
export function applyHttpSecurity(app: INestApplication, swaggerEnabled: boolean): void {
  app.use(helmet({ contentSecurityPolicy: swaggerEnabled ? false : undefined }));
}
