import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import * as crypto from 'crypto';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  console.log('--- Iniciando migración de class_students a enrollments ---');

  try {
    // 1. Asegurarnos de que las tablas existan (sync debería haberlas creado)
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    
    const hasClassStudents = await queryRunner.hasTable('class_students');
    const hasEnrollments = await queryRunner.hasTable('enrollments');

    if (!hasClassStudents) {
      console.log('No existe la tabla class_students. Nada que migrar.');
      await app.close();
      return;
    }

    if (!hasEnrollments) {
      console.log('No existe la tabla enrollments. Asegúrate de ejecutar la app para que TypeORM sincronice la BD primero.');
      await app.close();
      return;
    }

    // 2. Obtener datos de class_students
    const oldRecords = await queryRunner.query(`SELECT * FROM class_students`);
    console.log(`Se encontraron ${oldRecords.length} registros en class_students.`);

    let migrated = 0;
    let skipped = 0;

    // 3. Insertar en enrollments
    for (const record of oldRecords) {
      const studentId = record.studentId;
      const classId = record.classId;
      const joinedAt = record.registration_date || new Date();
      const id = crypto.randomUUID();

      try {
        await queryRunner.query(
          `INSERT INTO enrollments (id, classId, studentId, status, joined_at, left_at, last_activity_at) 
           VALUES (?, ?, ?, ?, ?, NULL, NULL)`,
          [id, classId, studentId, 'active', joinedAt]
        );
        migrated++;
      } catch (err: any) {
        if (err.code === 'ER_DUP_ENTRY') {
          console.log(`Saltando duplicado: studentId ${studentId}, classId ${classId}`);
          skipped++;
        } else {
          console.error(`Error migrando registro (student: ${studentId}, class: ${classId}):`, err.message);
        }
      }
    }

    console.log(`Migración completada. Migrados: ${migrated}, Saltados: ${skipped}`);
    
    // 4. (Opcional) Renombrar o eliminar class_students
    // await queryRunner.query('DROP TABLE class_students');
    
    await queryRunner.release();

  } catch (error) {
    console.error('Error durante la migración:', error);
  }

  await app.close();
}

bootstrap();
