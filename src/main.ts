import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { applyHttpSecurity, isSwaggerEnabled } from './common/http-security';
import { applyCors, parseAllowedOrigins } from './common/cors-options';
import { BufferedLogger } from './admin-system/buffered-logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: new BufferedLogger() });
  const swaggerEnabled = isSwaggerEnabled();

  // Detrás de un proxy inverso (Caddy, Railway, etc.) la IP real llega en X-Forwarded-For; sin esto
  // TODAS las peticiones parecen venir del proxy y comparten el mismo límite de peticiones.
  // TRUST_PROXY = número de proxies de confianza delante del backend (0 = ninguno).
  const trustProxy = Number(process.env.TRUST_PROXY ?? 0);
  if (trustProxy > 0) app.getHttpAdapter().getInstance().set('trust proxy', trustProxy);

  applyHttpSecurity(app, swaggerEnabled);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  applyCors(app, parseAllowedOrigins(process.env.CORS_ORIGIN));

  // Global exception filter to sanitize errors in production
  app.useGlobalFilters(new HttpExceptionFilter());

  if (swaggerEnabled) {
    const config = new DocumentBuilder()
      .setTitle('STIRE Platform API')
      .setDescription('LMS adaptativo con Tutor IA e integración LeetCode-style')
      .setVersion('2.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Aplicación escuchando en puerto ${port}`);
  console.log(
    swaggerEnabled
      ? `Swagger Docs disponibles en http://localhost:${port}/docs`
      : 'Swagger Docs desactivado (producción). Use SWAGGER_ENABLED=true para publicarlo.',
  );
}
bootstrap();