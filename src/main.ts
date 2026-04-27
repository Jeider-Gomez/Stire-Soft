import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configurar ValidationPipe globalmente
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina propiedades no definidas en el DTO
      forbidNonWhitelisted: true, // Lanza error si hay propiedades no permitidas
      transform: true, // Transforma los datos al tipo definido en el DTO
    }),
  );

  // Habilitar CORS (opcional, para desarrollo con frontend)
  app.enableCors();

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Aplicación escuchando en puerto ${port}`);
  console.log('🚀 Servidor corriendo en http://localhost:3000');
}
bootstrap();