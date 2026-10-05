import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Segunda parte de la encuesta, distinta por rol (src/usabilidad/sus.ts, TAREAS_POR_ROL): la facilidad de 1 a 7 de las
 * tareas clave de estudiantes y docentes.
 */
export class TareasEncuesta1792500000000 implements MigrationInterface {
  name = 'TareasEncuesta1792500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `encuestas_sus` ADD `tareas` json NULL');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `encuestas_sus` DROP COLUMN `tareas`');
  }
}
