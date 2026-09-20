import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { applyHttpSecurity, isSwaggerEnabled } from './common/http-security';
import { BufferedLogger } from './admin-system/buffered-logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: new BufferedLogger() });
  const swaggerEnabled = isSwaggerEnabled();

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

  const corsOriginEnv = process.env.CORS_ORIGIN || '';
  const allowedOrigins = corsOriginEnv
    ? corsOriginEnv.split(',').map((o) => o.trim()).filter(Boolean)
    : ['http://localhost:5173', 'http://localhost:3000'];

  app.enableCors({
    origin: (origin, callback) => {
      // allow requests with no origin (e.g. mobile apps, curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('CORS policy: origin not allowed by CORS'), false);
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

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