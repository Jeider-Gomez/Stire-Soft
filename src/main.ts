import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import * as express from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user/entities/user.entity';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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

  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Global exception filter to sanitize errors in production
  app.useGlobalFilters(new HttpExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('STIRE Platform API')
    .setDescription('LMS adaptativo con Tutor IA e integración LeetCode-style')
    .setVersion('2.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // Auto-seed if database has no users
  try {
    const userRepo = app.get(getRepositoryToken(User));
    const count = await userRepo.count();
    if (count === 0) {
      console.log('Base de datos vacía detectada. Ejecutando sembrado inicial de demostración...');
      const { runMasterSeed } = await import('./seeds/seed-runner.js');
      await runMasterSeed();
    }
  } catch (err: any) {
    console.warn('Verificación de sembrado inicial:', err?.message || err);
  }

  // Servir frontend compilado de Nuxt si existe
  const publicDir = path.join(process.cwd(), 'frontend-nuxt/.output/public');
  if (fs.existsSync(publicDir)) {
    const expressApp = app.getHttpAdapter().getInstance();
    expressApp.use(express.static(publicDir));

    const apiPrefixes = [
      '/api',
      '/docs',
      '/auth',
      '/class',
      '/users',
      '/activities',
      '/activity-questions',
      '/submissions',
      '/enrollment',
      '/learning-unit',
      '/learning-progress',
      '/topic',
      '/sections',
      '/content',
      '/activity-types',
      '/review-schedules',
      '/tutor',
      '/message',
      '/notifications',
      '/analytics',
      '/activity-log',
      '/maintenance',
      '/institutions',
      '/programs',
    ];

    expressApp.use((req: any, res: any, next: any) => {
      if (req.method !== 'GET') {
        return next();
      }

      const isApi = apiPrefixes.some(
        (prefix) => req.path === prefix || req.path.startsWith(`${prefix}/`),
      );
      if (isApi) {
        return next();
      }

      // Probar si existe un archivo específico prerenderizado (ej. /auth/login -> /auth/login/index.html)
      const cleanPath = req.path.replace(/^\/+|\/+$/g, '');
      const specificFile = path.join(publicDir, cleanPath, 'index.html');
      if (cleanPath && fs.existsSync(specificFile)) {
        return res.sendFile(specificFile);
      }

      const fallback200 = path.join(publicDir, '200.html');
      if (fs.existsSync(fallback200)) {
        return res.sendFile(fallback200);
      }

      const indexPath = path.join(publicDir, 'index.html');
      if (fs.existsSync(indexPath)) {
        return res.sendFile(indexPath);
      }
      next();
    });
  }

  const port = 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`Aplicación STIRE escuchando en puerto ${port} (0.0.0.0:${port})`);
  console.log(`Swagger Docs disponibles en http://localhost:${port}/docs`);
}
bootstrap();