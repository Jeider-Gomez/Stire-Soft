import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);
  
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();

  try {
    const hasTable = await queryRunner.hasTable('class_students');
    if (hasTable) {
      await queryRunner.query('DROP TABLE class_students');
      console.log('Tabla class_students eliminada correctamente.');
    } else {
      console.log('La tabla class_students no existe.');
    }
  } catch (error) {
    console.error('Error al intentar eliminar la tabla:', error);
  } finally {
    await queryRunner.release();
    await app.close();
  }
}

bootstrap();
